import { BaseDomainOffsetPaginationResultDto } from '../../../../../common/dto/base-domain-offset-pagination-result.dto';
import { MinistryGroupModel } from '../../../entity/ministry-group.entity';

export class MinistryGroupDomainPaginationResponseDto extends BaseDomainOffsetPaginationResultDto<MinistryGroupModel> {
  constructor(data: MinistryGroupModel[], totalCount: number) {
    super(data, totalCount);
  }
}
