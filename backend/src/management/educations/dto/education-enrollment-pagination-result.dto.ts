import { BasePaginationResultDto } from '../../../common/dto/base-pagination-result.dto';
import { EducationEnrollmentModel } from '../entity/education-enrollment.entity';

export interface EducationEnrollmentPaginationResultDto
  extends BasePaginationResultDto<EducationEnrollmentModel> {}
