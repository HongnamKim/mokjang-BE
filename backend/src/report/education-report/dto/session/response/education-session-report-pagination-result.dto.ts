import { BaseOffsetPaginationResponseDto } from '../../../../../common/dto/reponse/base-offset-pagination-response.dto';
import { EducationSessionReportModel } from '../../../entity/education-session-report.entity';

export class EducationSessionReportPaginationResultDto {
  constructor(
    public readonly data: EducationSessionReportModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
