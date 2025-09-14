import { MemberModel } from '../../../../../members/entity/member.entity';

export class PatchMinistryGroupLeaderResponseDto {
  constructor(
    public readonly data: MemberModel,
    public readonly timestamp: Date = new Date(),
  ) {}
}
