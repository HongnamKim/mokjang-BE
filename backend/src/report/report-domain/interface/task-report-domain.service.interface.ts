import { TaskModel } from '../../../task/entity/task.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { TaskReportModel } from '../../entity/task-report.entity';
import { TaskReportDomainPaginationResultDto } from '../../dto/task-report/task-report-domain-pagination-result.dto';

export const ITASK_REPORT_DOMAIN_SERVICE = Symbol(
  'ITASK_REPORT_DOMAIN_SERVICE',
);

export interface ITaskReportDomainService {
  createTaskReport(
    task: TaskModel,
    sender: MemberModel,
    receiver: MemberModel,
    qr: QueryRunner,
  ): Promise<TaskReportModel>;

  findTaskReportsByReceiver(
    receiver: MemberModel,
    dto: any,
    qr?: QueryRunner,
  ): Promise<TaskReportDomainPaginationResultDto>;

  findTaskReportModelById(
    receiver: MemberModel,
    reportId: number,
    isRead: boolean,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<TaskReportModel>,
  ): Promise<TaskReportModel>;

  updateTaskReport(
    taskReport: TaskReportModel,
    dto: any,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteTaskReport(
    taskReport: TaskReportModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteTaskReports(
    taskReports: TaskReportModel[],
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
