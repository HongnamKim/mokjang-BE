import { BaseOffsetPaginationResultDto } from '../../../common/dto/base-offset-pagination-result.dto';
import { EducationEnrollmentModel } from '../../../management/educations/entity/education-enrollment.entity';

export class EducationHistoryPaginationResultDto extends BaseOffsetPaginationResultDto<EducationEnrollmentModel> {
  constructor(
    public readonly data: EducationEnrollmentModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
    public readonly inProgressCount: number,
    public readonly completedCount: number,
    public readonly incompleteCount: number,
  ) {
    super(data, totalCount, count, page);
  }
}
