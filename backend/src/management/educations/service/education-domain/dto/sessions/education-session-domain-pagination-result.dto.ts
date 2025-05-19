import { BaseDomainOffsetPaginationResultDto } from '../../../../../../common/dto/base-domain-offset-pagination-result.dto';
import { EducationSessionModel } from '../../../../entity/education-session.entity';

export class EducationSessionDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<EducationSessionModel> {
  constructor(data: EducationSessionModel[], totalCount: number) {
    super(data, totalCount);
  }
}
