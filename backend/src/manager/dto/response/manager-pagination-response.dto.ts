import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { MemberModel } from '../../../members/entity/member.entity';

export class ManagerPaginationResponseDto extends BaseOffsetPaginationResponseDto<MemberModel> {
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
