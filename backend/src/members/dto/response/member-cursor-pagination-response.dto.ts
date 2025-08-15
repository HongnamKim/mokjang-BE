import { BaseCursorPaginationResponseDto } from '../../../common/dto/base-cursor-pagination-response.dto';
import { MemberModel } from '../../entity/member.entity';

export class MemberCursorPaginationResponseDto extends BaseCursorPaginationResponseDto<MemberModel> {
  constructor(
    data: MemberModel[],
    count: number,
    nextCursor: string | undefined,
    hasMore: boolean,
  ) {
    super(data, count, nextCursor, hasMore);
  }
}
