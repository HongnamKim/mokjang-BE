import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskReportModel } from '../../entity/task-report.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ITaskReportDomainService } from '../interface/task-report-domain.service.interface';
import { TaskModel } from '../../../../task/entity/task.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { GetTaskReportDto } from '../../dto/get-task-report.dto';
import { MAX_RECEIVER_COUNT } from '../../../base-report/const/report.constraints';
import { AddConflictExceptionV2 } from '../../../../common/exception/add-conflict.exception';
import { UpdateTaskReportDto } from '../../dto/request/update-task-report.dto';
import { ChurchUserModel } from '../../../../church-user/entity/church-user.entity';
import { RemoveConflictException } from '../../../../common/exception/remove-conflict.exception';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../../members/const/member-find-options.const';
import { differenceInDays } from 'date-fns';
import { ReportOrder } from '../../../base-report/const/report-order.enum';
import {
  TaskReportFindOptionsSelect,
  TaskReportsFindOptionsRelation,
  TaskReportsFindOptionsSelect,
} from '../../const/task-report-find-options.const';
import { ReportException } from '../../../exception/report.exception';

@Injectable()
export class TaskReportDomainService implements ITaskReportDomainService {
  constructor(
    @InjectRepository(TaskReportModel)
    private readonly taskReportRepository: Repository<TaskReportModel>,
  ) {}

  private getTaskReportRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(TaskReportModel)
      : this.taskReportRepository;
  }

  async createTaskReports(
    task: TaskModel,
    receivers: ChurchUserModel[],
    qr: QueryRunner,
  ) {
    const repository = this.getTaskReportRepository(qr);

    const oldReports = await repository.find({
      where: { taskId: task.id },
      select: { receiverId: true },
    });

    const oldReceiverIds = new Set(
      oldReports.map((report) => report.receiverId),
    );

    if (oldReports.length + receivers.length > MAX_RECEIVER_COUNT) {
      throw new ConflictException(ReportException.EXCEED_RECEIVERS);
    }

    const failed: { receiverName: string; reason: string }[] = [];

    // 피보고자 중복 체크
    for (const receiver of receivers) {
      if (oldReceiverIds.has(receiver.member.id)) {
        failed.push({
          receiverName: receiver.member.name,
          reason: ReportException.ALREADY_REPORTED_MEMBER,
        });
      }
    }

    if (failed.length > 0) {
      throw new AddConflictExceptionV2(
        ReportException.FAIL_ADD_REPORT_RECEIVERS,
        failed,
      );
    }

    const reports = receivers.map((receiver) =>
      repository.create({
        task: task,
        receiver: receiver.member,
        reportedAt: new Date(),
        isRead: false,
        isConfirmed: false,
      }),
    );

    return repository.save(reports);
  }

  async findTaskReportsByReceiver(
    receiver: MemberModel,
    dto: GetTaskReportDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getTaskReportRepository(qr);

    const order: FindOptionsOrder<TaskReportModel> =
      dto.order === ReportOrder.START_DATE || dto.order === ReportOrder.END_DATE
        ? {
            task: {
              [dto.order]: dto.orderDirection,
            },
          }
        : {
            [dto.order]: dto.orderDirection,
          };

    return repository.find({
      where: {
        receiverId: receiver.id,
        isRead: dto.isRead && dto.isRead,
        isConfirmed: dto.isConfirmed && dto.isConfirmed,
      },
      order,
      relations: TaskReportsFindOptionsRelation,
      select: TaskReportsFindOptionsSelect,
    });
  }

  async findTaskReportById(
    receiver: MemberModel,
    reportId: number,
    checkIsRead: boolean,
    qr?: QueryRunner,
  ) {
    const repository = this.getTaskReportRepository(qr);

    const report = await repository.findOne({
      where: {
        id: reportId,
        receiverId: receiver.id,
      },
      relations: TaskReportsFindOptionsRelation,
      select: TaskReportFindOptionsSelect,
    });

    if (!report) {
      throw new NotFoundException(ReportException.NOT_FOUND);
    }

    if (checkIsRead) {
      report.isRead = true;
      await repository.save(report);
    }

    return report;
  }

  async findTaskReportModelById(
    receiver: MemberModel,
    reportId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<TaskReportModel>,
  ): Promise<TaskReportModel> {
    const repository = this.getTaskReportRepository(qr);

    const task = await repository.findOne({
      where: {
        receiverId: receiver.id,
        id: reportId,
      },
      relations: relationOptions,
    });

    if (!task) {
      throw new NotFoundException(ReportException.NOT_FOUND);
    }

    return task;
  }

  async updateTaskReport(
    taskReport: TaskReportModel,
    dto: UpdateTaskReportDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getTaskReportRepository(qr);

    const result = await repository.update(
      {
        id: taskReport.id,
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ReportException.UPDATE_ERROR);
    }

    return result;
  }

  async deleteTaskReport(taskReport: TaskReportModel, qr?: QueryRunner) {
    const repository = this.getTaskReportRepository(qr);

    const result = await repository.softDelete({ id: taskReport.id });

    if (result.affected === 0) {
      throw new InternalServerErrorException(ReportException.DELETE_ERROR);
    }

    return result;
  }

  async deleteTaskReportCascade(
    task: TaskModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getTaskReportRepository(qr);

    return repository.softDelete({ taskId: task.id });
  }

  async deleteTaskReports(
    task: TaskModel,
    receiverIds: number[],
    qr?: QueryRunner,
  ) {
    const repository = this.getTaskReportRepository(qr);

    const reports = await repository.find({
      where: {
        taskId: task.id,
      },
    });
    const oldReceiverIds = new Set(reports.map((report) => report.receiverId));

    const notExistReceiverIds = receiverIds.filter(
      (id) => !oldReceiverIds.has(id),
    );

    if (notExistReceiverIds.length > 0) {
      throw new RemoveConflictException(
        ReportException.NOT_EXIST_REPORTED_MEMBER,
        notExistReceiverIds,
      );
    }

    const result = await repository.softDelete({
      taskId: task.id,
      receiverId: In(receiverIds),
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(ReportException.DELETE_ERROR);
    }

    return result;
  }

  findMyReports(
    receiver: MemberModel,
    from: Date,
    to: Date,
  ): Promise<TaskReportModel[]> {
    const repository = this.getTaskReportRepository();

    const take = differenceInDays(to, from) > 14 ? 100 : 50;

    return repository.find({
      take,
      where: {
        receiverId: receiver.id,
        task: {
          startDate: LessThanOrEqual(to),
          endDate: MoreThanOrEqual(from),
        },
      },
      order: {
        task: {
          endDate: 'ASC',
        },
      },
      relations: {
        task: {
          inCharge: MemberSummarizedRelation,
        },
      },
      select: {
        task: {
          id: true,
          createdAt: true,
          updatedAt: true,
          taskType: true,
          title: true,
          status: true,
          startDate: true,
          endDate: true,
          inCharge: MemberSummarizedSelect,
        },
      },
    });
  }
}
