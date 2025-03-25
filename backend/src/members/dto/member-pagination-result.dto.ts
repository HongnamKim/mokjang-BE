import { BasePaginationResultDto } from '../../common/dto/base-pagination-result.dto';
import { MemberModel } from '../entity/member.entity';

export interface MemberPaginationResultDto
  extends BasePaginationResultDto<MemberModel> {
  totalPage: number;
}
