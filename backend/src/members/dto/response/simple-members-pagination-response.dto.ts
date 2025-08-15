import { MemberModel } from '../../entity/member.entity';

export class SimpleMembersPaginationResponseDto {
  constructor(
    public readonly data: MemberModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
