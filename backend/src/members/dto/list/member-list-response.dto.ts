import { MemberListItemDto } from './member-list-item.dto';

export class MemberListResponseDto {
  data: MemberListItemDto[];
  nextCursor?: string;
  hasMore: boolean;
}
