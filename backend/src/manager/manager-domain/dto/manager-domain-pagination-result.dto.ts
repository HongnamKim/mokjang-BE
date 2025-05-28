import { BaseDomainOffsetPaginationResultDto } from '../../../common/dto/base-domain-offset-pagination-result.dto';
import { MemberModel } from '../../../members/entity/member.entity';

export class ManagerDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<MemberModel> {
  constructor(data: MemberModel[], totalCount: number) {
    super(data, totalCount);
  }
}
