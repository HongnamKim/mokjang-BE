import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { VisitationReportModel } from '../entity/visitation-report.entity';

export class VisitationReportPaginationResultDto {
  constructor(
    public readonly data: VisitationReportModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
