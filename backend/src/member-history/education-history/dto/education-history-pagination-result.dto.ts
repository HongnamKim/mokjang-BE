import { EducationEnrollmentModel } from '../../../educations/education-enrollment/entity/education-enrollment.entity';

export class EducationHistoryPaginationResultDto {
  constructor(
    public readonly data: EducationEnrollmentModel[],
    //public readonly inProgressCount: number,
    public readonly completedCount: number,
    public readonly incompleteCount: number,
  ) {}
}
