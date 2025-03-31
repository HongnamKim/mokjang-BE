import { BasePaginationResultDto } from '../../../common/dto/base-pagination-result.dto';
import { OfficerHistoryModel } from '../../entity/officer-history.entity';

export interface OfficerHistoryPaginationResultDto
  extends BasePaginationResultDto<OfficerHistoryModel> {
  totalPage: number;
}
