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
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ITaskReportDomainService } from '../interface/task-report-domain.service.interface';
import { TaskModel } from '../../../task/entity/task.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { TaskReportException } from '../../const/exception/task-report.exception';
import { TaskReportDomainPaginationResultDto } from '../../dto/task-report/task-report-domain-pagination-result.dto';
import { GetTaskReportDto } from '../../dto/task-report/get-task-report.dto';
import { TaskReportOrderEnum } from '../../const/task-report-order.enum';
import { MAX_RECEIVER_COUNT } from '../../const/report.constraints';
import { AddConflictExceptionV2 } from '../../../common/exception/add-conflict.exception';
import { UpdateTaskReportDto } from '../../dto/task-report/request/update-task-report.dto';
import {
  TaskReportFindOptionsSelect,
  TaskReportsFindOptionsRelation,
  TaskReportsFindOptionsSelect,
} from '../../const/report-find-options.const';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { RemoveConflictException } from '../../../common/exception/remove-conflict.exception';

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

    const oldReports = await repository.find({ where: { taskId: task.id } });
    const oldReceiverIds = new Set(
      oldReports.map((report) => report.receiverId),
    );

    if (oldReports.length + receivers.length > MAX_RECEIVER_COUNT) {
      throw new ConflictException(TaskReportException.EXCEED_RECEIVERS);
    }

    const failed: { receiverId: number; reason: string }[] = [];

    // 피보고자 중복 체크
    for (const receiver of receivers) {
      if (oldReceiverIds.has(receiver.id)) {
        failed.push({
          receiverId: receiver.id,
          reason: TaskReportException.ALREADY_REPORTED_MEMBER,
        });
      }
    }

    if (failed.length > 0) {
      throw new AddConflictExceptionV2('피보고자 추가 실패', failed);
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
        relations: TaskReportsFindOptionsRelation,
        select: TaskReportsFindOptionsSelect,
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
        TaskReportException.NOT_EXIST_REPORTED_MEMBER,
        notExistReceiverIds,
      );
    }

    const result = await repository.softDelete({
      taskId: task.id,
      receiverId: In(receiverIds),
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(TaskReportException.DELETE_ERROR);
    }

    return result;
  }
}
