import { BasePaginationResultDto } from '../../../common/dto/base-pagination-result.dto';
import { EducationTermModel } from '../../entity/education/education-term.entity';

export interface EducationTermPaginationResultDto
  extends BasePaginationResultDto<EducationTermModel> {}
