import { MemberDto } from '../../../../../../members/dto/member.dto';

export class GetMinistryGroupMembersResponseDto {
  constructor(
    public readonly data: MemberDto[],
    public timestamp: Date = new Date(),
  ) {}
}
