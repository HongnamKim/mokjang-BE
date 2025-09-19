import { ChurchJoinModel } from '../../entity/church-join.entity';

export class JoinRequestPaginationResult {
  constructor(
    public readonly data: ChurchJoinModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
