import { BasePaginationResultDto } from '../../../common/dto/base-pagination-result.dto';
import { MinistryHistoryModel } from '../../entity/ministry-history.entity';

export interface MinistryHistoryPaginationResult
  extends BasePaginationResultDto<MinistryHistoryModel> {
  totalPage: number;
}
