import { MemberModel } from '../../../../../members/entity/member.entity';

export class GetOfficerMembersResponseDto {
  constructor(
    public readonly data: MemberModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
