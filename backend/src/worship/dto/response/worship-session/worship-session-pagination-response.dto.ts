import { WorshipSessionModel } from '../../../entity/worship-session.entity';

export class WorshipSessionPaginationResponseDto {
  constructor(
    public readonly data: WorshipSessionModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
