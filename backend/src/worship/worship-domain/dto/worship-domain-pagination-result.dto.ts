import { BaseDomainOffsetPaginationResultDto } from '../../../common/dto/base-domain-offset-pagination-result.dto';
import { WorshipModel } from '../../entity/worship.entity';

export class WorshipDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<WorshipModel> {
  constructor(data: WorshipModel[], totalCount: number) {
    super(data, totalCount);
  }
}
