import { OfficerModel } from '../entity/officer.entity';
import { BaseDomainOffsetPaginationResultDto } from '../../../common/dto/base-domain-offset-pagination-result.dto';

export class OfficerDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<OfficerModel> {
  constructor(
    public readonly data: OfficerModel[],
    public readonly totalCount: number,
  ) {
    super(data, totalCount);
  }
}
