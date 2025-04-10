import { BasePaginationResultDto } from '../../common/dto/base-pagination-result.dto';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';

export interface VisitationPaginationResultDto
  extends BasePaginationResultDto<VisitationMetaModel> {
  totalPage: number;
}
