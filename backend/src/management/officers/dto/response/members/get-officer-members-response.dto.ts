import { OfficerMemberDto } from '../../../../../members/dto/officer-member.dto';
import { MemberDto } from '../../../../../members/dto/member.dto';

export class GetOfficerMembersResponseDto {
  constructor(
    public readonly data: OfficerMemberDto[] | MemberDto[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
