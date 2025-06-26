import { BaseDomainOffsetPaginationResultDto } from '../../../common/dto/base-domain-offset-pagination-result.dto';
import { WorshipEnrollmentModel } from '../../entity/worship-enrollment.entity';

export class WorshipEnrollmentDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<WorshipEnrollmentModel> {
  constructor(data: WorshipEnrollmentModel[], totalCount: number) {
    super(data, totalCount);
  }
}
