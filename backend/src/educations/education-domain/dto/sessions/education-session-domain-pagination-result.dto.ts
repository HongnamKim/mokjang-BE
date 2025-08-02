import { EducationSessionModel } from '../../../education-session/entity/education-session.entity';
import { BaseDomainOffsetPaginationResultDto } from '../../../../common/dto/base-domain-offset-pagination-result.dto';

export class EducationSessionDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<EducationSessionModel> {
  constructor(data: EducationSessionModel[], totalCount: number) {
    super(data, totalCount);
  }
}
