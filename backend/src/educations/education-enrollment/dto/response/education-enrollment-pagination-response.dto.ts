import { EducationEnrollmentModel } from '../../entity/education-enrollment.entity';

export class EducationEnrollmentPaginationResponseDto {
  constructor(
    public readonly data: EducationEnrollmentModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
