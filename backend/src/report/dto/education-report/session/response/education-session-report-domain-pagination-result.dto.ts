import { BaseDomainOffsetPaginationResultDto } from '../../../../../common/dto/base-domain-offset-pagination-result.dto';
import { EducationSessionReportModel } from '../../../../entity/education-session-report.entity';

export class EducationSessionReportDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<EducationSessionReportModel> {
  constructor(data: EducationSessionReportModel[], totalCount: number) {
    super(data, totalCount);
  }
}
