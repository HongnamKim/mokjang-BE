import { BasePaginationResultDto } from '../../../common/dto/base-pagination-result.dto';
import { EducationEnrollmentModel } from '../../../management/educations/entity/education-enrollment.entity';

export interface EducationHistoryPaginationResultDto
  extends BasePaginationResultDto<EducationEnrollmentModel> {
  totalPage: number;
  inProgressCount: number;
  completedCount: number;
  incompleteCount: number;
}
