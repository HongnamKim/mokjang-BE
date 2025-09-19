import { MinistryModel } from '../../../entity/ministry.entity';

export class GetMinistryResponseDto {
  constructor(
    public readonly data: MinistryModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
