import { GroupModel } from '../../../entity/group.entity';

export class AddMembersToGroupResponseDto {
  constructor(
    public readonly data: GroupModel,
    public readonly timestamp: Date = new Date(),
  ) {}
}
