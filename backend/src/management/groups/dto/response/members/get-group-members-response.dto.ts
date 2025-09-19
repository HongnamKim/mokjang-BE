import { GroupMemberDto } from '../../../../../members/dto/group-member.dto';
import { MemberDto } from '../../../../../members/dto/member.dto';

export class GetGroupMembersResponseDto {
  constructor(
    public readonly data: GroupMemberDto[] | MemberDto[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
