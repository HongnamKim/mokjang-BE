import { OfficerModel } from '../../../entity/officer.entity';

export class AddMembersToOfficerResponseDto {
  constructor(
    public readonly data: OfficerModel,
    public readonly timestamp: Date = new Date(),
  ) {}
}
