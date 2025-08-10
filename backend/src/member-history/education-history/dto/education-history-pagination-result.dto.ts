import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { EducationEnrollmentModel } from '../../../educations/education-enrollment/entity/education-enrollment.entity';

export class EducationHistoryPaginationResultDto extends BaseOffsetPaginationResponseDto<EducationEnrollmentModel> {
  constructor(
    public readonly data: EducationEnrollmentModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
    //public readonly inProgressCount: number,
    public readonly completedCount: number,
    public readonly incompleteCount: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
