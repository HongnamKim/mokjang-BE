import { TaskModel } from '../../../../task/entity/task.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { TaskReportModel } from '../../entity/task-report.entity';
import { TaskReportDomainPaginationResultDto } from '../../dto/task-report-domain-pagination-result.dto';
import { GetTaskReportDto } from '../../dto/get-task-report.dto';
import { UpdateTaskReportDto } from '../../dto/request/update-task-report.dto';
import { ChurchUserModel } from '../../../../church-user/entity/church-user.entity';

export const ITASK_REPORT_DOMAIN_SERVICE = Symbol(
  'ITASK_REPORT_DOMAIN_SERVICE',
);

export interface ITaskReportDomainService {
  createTaskReports(
    task: TaskModel,
    receivers: ChurchUserModel[],
    qr: QueryRunner,
  ): Promise<TaskReportModel[]>;

  findTaskReportsByReceiver(
    receiver: MemberModel,
    dto: GetTaskReportDto,
    qr?: QueryRunner,
  ): Promise<TaskReportModel[]>;

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

  deleteTaskReportCascade(
    task: TaskModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteTaskReports(
    task: TaskModel,
    receiverIds: number[],
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  findMyReports(
    receiver: MemberModel,
    from: Date,
    to: Date,
  ): Promise<TaskReportModel[]>;
}
