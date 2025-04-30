import { BaseDomainOffsetPaginationResultDto } from '../../../../../common/dto/base-domain-offset-pagination-result.dto';
import { MinistryModel } from '../../../entity/ministry.entity';

export class MinistryDomainPaginationResponseDto extends BaseDomainOffsetPaginationResultDto<MinistryModel> {
  constructor(
    public readonly data: MinistryModel[],
    public readonly totalCount: number,
  ) {
    super(data, totalCount);
  }
}
