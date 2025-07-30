import { OfficerMemberDto } from '../../../../../members/dto/officer-member.dto';

export class GetOfficerMembersResponseDto {
  constructor(
    public readonly data: OfficerMemberDto[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
