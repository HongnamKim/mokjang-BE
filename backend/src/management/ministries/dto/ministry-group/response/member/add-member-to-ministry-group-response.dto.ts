import { MinistryGroupModel } from '../../../../entity/ministry-group.entity';

export class AddMemberToMinistryGroupResponseDto {
  constructor(
    public readonly data: MinistryGroupModel,
    public readonly timestamp: Date = new Date(),
  ) {}
}
