import { BasePaginationResultDto } from '../../../common/dto/base-pagination-result.dto';
import { VisitationReportModel } from '../../entity/visitation-report.entity';

export interface VisitationReportPaginationResultDto
  extends BasePaginationResultDto<VisitationReportModel> {
  totalPage: number;
}
