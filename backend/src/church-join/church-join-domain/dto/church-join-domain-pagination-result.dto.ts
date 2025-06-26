import { BaseDomainOffsetPaginationResultDto } from '../../../common/dto/base-domain-offset-pagination-result.dto';
import { ChurchJoinModel } from '../../entity/church-join.entity';

export class ChurchJoinDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<ChurchJoinModel> {
  constructor(data: ChurchJoinModel[], totalCount: number) {
    super(data, totalCount);
  }
}
