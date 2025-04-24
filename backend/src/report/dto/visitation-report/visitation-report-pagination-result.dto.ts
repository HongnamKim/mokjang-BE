import { BaseOffsetPaginationResultDto } from '../../../common/dto/base-offset-pagination-result.dto';
import { VisitationReportModel } from '../../entity/visitation-report.entity';

/*export interface VisitationReportPaginationResultDto
  extends BaseOffsetPaginationResultDto<VisitationReportModel> {
  totalPage: number;
}*/

export class VisitationReportPaginationResultDto extends BaseOffsetPaginationResultDto<VisitationReportModel> {
  constructor(
    public readonly data: VisitationReportModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
