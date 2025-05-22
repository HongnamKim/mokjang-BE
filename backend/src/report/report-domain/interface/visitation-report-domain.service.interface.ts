import { VisitationMetaModel } from '../../../visitation/entity/visitation-meta.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { VisitationReportModel } from '../../entity/visitation-report.entity';
import { GetVisitationReportDto } from '../../dto/visitation-report/get-visitation-report.dto';
import { UpdateVisitationReportDto } from '../../dto/visitation-report/update-visitation-report.dto';

export const IVISITATION_REPORT_DOMAIN_SERVICE = Symbol(
  'IVISITATION_REPORT_DOMAIN_SERVICE',
);

export interface IVisitationReportDomainService {
  findVisitationReportsByReceiver(
    receiver: MemberModel,
    dto: GetVisitationReportDto,
    qr?: QueryRunner,
  ): Promise<{ data: VisitationReportModel[]; totalCount: number }>;

  createVisitationReport(
    visitation: VisitationMetaModel,
    //sender: MemberModel,
    receiver: MemberModel,
    qr: QueryRunner,
  ): Promise<VisitationReportModel>;

  findVisitationReportModelById(
    receiver: MemberModel,
    reportId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<VisitationReportModel>,
  ): Promise<VisitationReportModel>;

  findVisitationReportById(
    receiver: MemberModel,
    reportId: number,
    isRead: boolean,
    qr?: QueryRunner,
  ): Promise<VisitationReportModel>;

  updateVisitationReport(
    visitationReport: VisitationReportModel,
    dto: UpdateVisitationReportDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteVisitationReport(
    visitationReport: VisitationReportModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteVisitationReports(
    visitationReports: VisitationReportModel[],
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
