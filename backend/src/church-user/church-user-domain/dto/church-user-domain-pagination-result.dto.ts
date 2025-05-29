import { BaseDomainOffsetPaginationResultDto } from '../../../common/dto/base-domain-offset-pagination-result.dto';
import { ChurchUserModel } from '../../entity/church-user.entity';

export class ChurchUserDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<ChurchUserModel> {
  constructor(data: ChurchUserModel[], totalCount: number) {
    super(data, totalCount);
  }
}
