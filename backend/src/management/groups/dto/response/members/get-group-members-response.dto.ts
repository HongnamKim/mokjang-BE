import { GroupMemberDto } from '../../../../../members/dto/group-member.dto';

export class GetGroupMembersResponseDto {
  constructor(
    public readonly data: GroupMemberDto[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
