import { GroupHistoryModel } from '../../entity/group-history.entity';

export class PatchGroupHistoryResponseDto {
  constructor(
    public readonly data: GroupHistoryModel,
    public readonly timestamp: Date = new Date(),
  ) {}
}
