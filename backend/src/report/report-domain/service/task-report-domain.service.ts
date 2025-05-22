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
  QueryRunner,
  Repository,
} from 'typeorm';
import { ITaskReportDomainService } from '../interface/task-report-domain.service.interface';
import { TaskModel } from '../../../task/entity/task.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { TaskReportException } from '../../const/exception/task-report.exception';
import { TaskReportDomainPaginationResultDto } from '../../dto/task-report/task-report-domain-pagination-result.dto';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { GetTaskReportDto } from '../../dto/task-report/get-task-report.dto';
import { TaskReportOrderEnum } from '../../const/task-report-order.enum';
import { MAX_RECEIVER_COUNT } from '../../const/report.constraints';
import { UserRole } from '../../../user/const/user-role.enum';
import { AddConflictExceptionV2 } from '../../../common/exception/add-conflict.exception';
import { UpdateTaskReportDto } from '../../dto/task-report/request/update-task-report.dto';

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

  assertCanAddReceivers(
    task: TaskModel & { reports: TaskReportModel[] },
    newReceiverIds: number[] | MemberModel[],
  ) {
    let reports = task.reports;

    if (reports === undefined) {
      throw new InternalServerErrorException('업무의 보고 정보 불러오기 실패');
    }

    if (reports.length + newReceiverIds.length > MAX_RECEIVER_COUNT) {
      throw new ConflictException(TaskReportException.EXCEED_RECEIVERS());
    }
  }

  async createTaskReports(
    task: TaskModel,
    //sender: MemberModel,
    receivers: MemberModel[],
    qr: QueryRunner,
  ) {
    const repository = this.getTaskReportRepository(qr);

    this.assertCanAddReceivers(task, receivers);

    const failed: { receiverId: number; reason: string }[] = [];

    const oldReceiverIds = new Set(task.reports.map((r) => r.receiverId));

    for (const receiver of receivers) {
      // 중복 체크
      if (oldReceiverIds.has(receiver.id)) {
        failed.push({
          receiverId: receiver.id,
          reason: TaskReportException.ALREADY_REPORTED_MEMBER,
        });
      }

      // 피보고자의 권한 체크
      if (
        !receiver.user ||
        (receiver.user.role !== UserRole.mainAdmin &&
          receiver.user.role !== UserRole.manager)
      ) {
        failed.push({
          receiverId: receiver.id,
          reason: TaskReportException.INVALID_RECEIVER_AUTHORIZATION,
        });
      }
    }

    if (failed.length > 0) {
      throw new AddConflictExceptionV2('피보고자 추가 실패', failed);
    }

    const reports = receivers.map((receiver) =>
      repository.create({
        task: task,
        //senderId: sender ? sender.id : undefined,
        receiver,
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

    const order: FindOptionsOrder<TaskReportModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== TaskReportOrderEnum.createdAt) {
      order.createdAt = 'asc';
    }

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: {
          receiverId: receiver.id,
          isRead: dto.isRead && dto.isRead,
          isConfirmed: dto.isConfirmed && dto.isConfirmed,
        },
        order,
        /*relations: {
          task: {
            inCharge: MemberSummarizedRelation,
          },
        },
        select: {
          task: {
            id: true,
            title: true,
            taskStartDate: true,
            taskEndDate: true,
            inCharge: MemberSummarizedSelect,
          },
        },*/
      }),
      repository.count({
        where: {
          receiverId: receiver.id,
          isRead: dto.isRead && dto.isRead,
          isConfirmed: dto.isConfirmed && dto.isConfirmed,
        },
      }),
    ]);

    return new TaskReportDomainPaginationResultDto(data, totalCount);
  }

  async findTaskReportById(
    receiver: MemberModel,
    reportId: number,
    checkIsRead: boolean,
    qr?: QueryRunner,
    //relationOptions?: FindOptionsRelations<TaskReportModel>,
  ) {
    const repository = this.getTaskReportRepository(qr);

    const report = await repository.findOne({
      where: {
        id: reportId,
        receiverId: receiver.id,
      },
      relations: {
        //sender: MemberSummarizedRelation,
        task: { inCharge: MemberSummarizedRelation },
      },
      select: {
        //sender: MemberSummarizedSelect,
        task: {
          title: true,
          taskStatus: true,
          taskStartDate: true,
          taskEndDate: true,
          inCharge: MemberSummarizedSelect,
        },
      },
    });

    if (!report) {
      throw new NotFoundException(TaskReportException.NOT_FOUND);
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
      throw new NotFoundException(TaskReportException.NOT_FOUND);
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
      throw new InternalServerErrorException(TaskReportException.UPDATE_ERROR);
    }

    return result;
  }

  async deleteTaskReport(taskReport: TaskReportModel, qr?: QueryRunner) {
    const repository = this.getTaskReportRepository(qr);

    const result = await repository.softDelete({ id: taskReport.id });

    if (result.affected === 0) {
      throw new InternalServerErrorException(TaskReportException.DELETE_ERROR);
    }

    return result;
  }

  async deleteTaskReports(taskReports: TaskReportModel[], qr?: QueryRunner) {
    const repository = this.getTaskReportRepository(qr);

    const reportIds = taskReports.map((taskReport) => taskReport.id);

    return repository.softDelete(reportIds);
  }
}
