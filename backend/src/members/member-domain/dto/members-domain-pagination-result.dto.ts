import { BaseDomainOffsetPaginationResultDto } from '../../../common/dto/base-domain-offset-pagination-result.dto';
import { MemberModel } from '../../entity/member.entity';

export class MembersDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<MemberModel> {
  constructor(data: MemberModel[], totalCount: number) {
    super(data, totalCount);
  }
}
