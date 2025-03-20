import { BasePaginationResultDto } from '../../../common/dto/base-pagination-result.dto';
import { EducationModel } from '../../entity/education/education.entity';

export interface EducationPaginationResultDto
  extends BasePaginationResultDto<EducationModel> {}
