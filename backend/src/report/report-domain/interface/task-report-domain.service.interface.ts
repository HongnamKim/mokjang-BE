import { TaskModel } from '../../../task/entity/task.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { TaskReportModel } from '../../entity/task-report.entity';
import { TaskReportDomainPaginationResultDto } from '../../dto/task-report/task-report-domain-pagination-result.dto';
import { GetTaskReportDto } from '../../dto/task-report/get-task-report.dto';
import { UpdateTaskReportDto } from '../../dto/task-report/request/update-task-report.dto';

export const ITASK_REPORT_DOMAIN_SERVICE = Symbol(
  'ITASK_REPORT_DOMAIN_SERVICE',
);

export interface ITaskReportDomainService {
  assertCanAddReceivers(
    task: TaskModel & { reports: TaskReportModel[] },
    newReceiverIds: number[] | MemberModel[],
  ): void;

  createTaskReports(
    task: TaskModel,
    sender: MemberModel,
    receivers: MemberModel[],
    qr: QueryRunner,
  ): Promise<TaskReportModel[]>;

  findTaskReportsByReceiver(
    receiver: MemberModel,
    dto: GetTaskReportDto,
    qr?: QueryRunner,
  ): Promise<TaskReportDomainPaginationResultDto>;

  findTaskReportById(
    receiver: MemberModel,
    reportId: number,
    checkIsRead: boolean,
    qr?: QueryRunner,
  ): Promise<TaskReportModel>;

  findTaskReportModelById(
    receiver: MemberModel,
    reportId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<TaskReportModel>,
  ): Promise<TaskReportModel>;

  updateTaskReport(
    taskReport: TaskReportModel,
    dto: UpdateTaskReportDto,
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
