import { BaseDomainOffsetPaginationResultDto } from '../../../../../common/dto/base-domain-offset-pagination-result.dto';
import { EducationReportModel } from '../../../entity/education-report.entity';

export class EducationSessionReportDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<EducationReportModel> {
  constructor(data: EducationReportModel[], totalCount: number) {
    super(data, totalCount);
  }
}
