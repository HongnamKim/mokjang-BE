import { GroupModel } from '../../../entity/group.entity';

export class RefreshMembersCountResponseDto {
  constructor(
    public readonly data: GroupModel,
    public readonly timestamp: Date = new Date(),
  ) {}
}
