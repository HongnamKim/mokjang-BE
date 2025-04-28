import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { VisitationReportModel } from '../../entity/visitation-report.entity';

/*export interface VisitationReportPaginationResultDto
  extends BaseOffsetPaginationResultDto<VisitationReportModel> {
  totalPage: number;
}*/

export class VisitationReportPaginationResultDto extends BaseOffsetPaginationResponseDto<VisitationReportModel> {
  constructor(
    public readonly data: VisitationReportModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
