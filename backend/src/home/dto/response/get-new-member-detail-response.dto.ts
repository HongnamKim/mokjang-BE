import { MemberModel } from '../../../members/entity/member.entity';

export class GetNewMemberDetailResponseDto {
  constructor(
    public readonly data: MemberModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
