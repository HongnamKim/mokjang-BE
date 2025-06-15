import { MemberModel } from '../../entity/member.entity';
import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';

export class SimpleMembersPaginationResponseDto extends BaseOffsetPaginationResponseDto<MemberModel> {
  constructor(
    data: MemberModel[],
    totalCount: number,
    count: number,
    page: number,
    totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
