import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskReportModel } from '../../entity/task-report.entity';
import { FindOptionsRelations, QueryRunner, Repository } from 'typeorm';
import { ITaskReportDomainService } from '../interface/task-report-domain.service.interface';
import { TaskModel } from '../../../task/entity/task.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { TaskReportException } from '../../const/exception/task-report.exception';
import { TaskReportDomainPaginationResultDto } from '../../dto/task-report/task-report-domain-pagination-result.dto';

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

  createTaskReport(
    task: TaskModel,
    sender: MemberModel,
    receiver: MemberModel,
    qr: QueryRunner,
  ) {
    const repository = this.getTaskReportRepository(qr);

    return repository.save({
      task: task,
      sender,
      receiver,
      reportedAt: new Date(),
      isRead: false,
      isConfirmed: false,
    });
  }

  async findTaskReportsByReceiver(
    receiver: MemberModel,
    dto: any,
    qr?: QueryRunner,
  ) {
    const repository = this.getTaskReportRepository(qr);

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: {
          receiverId: receiver.id,
        },
      }),
      repository.count({
        where: {
          receiverId: receiver.id,
        },
      }),
    ]);

    return new TaskReportDomainPaginationResultDto(data, totalCount);
  }

  async findTaskReportModelById(
    receiver: MemberModel,
    reportId: number,
    isRead: boolean,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<TaskReportModel>,
  ) {
    const repository = this.getTaskReportRepository(qr);

    const report = await repository.findOne({
      where: {
        id: reportId,
        receiverId: receiver.id,
      },
      relations: relationOptions,
    });

    if (!report) {
      throw new NotFoundException(TaskReportException.NOT_FOUND);
    }

    report.isRead = true;

    isRead && repository.save(report);

    return report;
  }

  async updateTaskReport(
    taskReport: TaskReportModel,
    dto: any,
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
