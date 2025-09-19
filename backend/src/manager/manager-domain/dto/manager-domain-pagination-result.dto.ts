import { BaseDomainOffsetPaginationResultDto } from '../../../common/dto/base-domain-offset-pagination-result.dto';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

export class ManagerDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<ChurchUserModel> {
  constructor(data: ChurchUserModel[], totalCount: number) {
    super(data, totalCount);
  }
}
