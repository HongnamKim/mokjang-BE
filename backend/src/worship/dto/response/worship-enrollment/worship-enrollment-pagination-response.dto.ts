import { WorshipEnrollmentModel } from '../../../entity/worship-enrollment.entity';

export class WorshipEnrollmentPaginationResponseDto {
  constructor(
    public readonly data: WorshipEnrollmentModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
