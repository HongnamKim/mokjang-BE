import { GroupModel } from '../../../entity/group.entity';

export class RemoveMembersFromGroupResponseDto {
  constructor(
    public readonly data: GroupModel,
    public readonly timestamp: Date = new Date(),
  ) {}
}
