import { OfficerModel } from '../../entity/officer.entity';

export class OfficerPaginationResponseDto {
  constructor(
    public readonly data: OfficerModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
