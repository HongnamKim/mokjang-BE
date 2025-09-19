import { WorshipModel } from '../../../entity/worship.entity';

export class WorshipPaginationResponseDto {
  constructor(
    public readonly data: WorshipModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
