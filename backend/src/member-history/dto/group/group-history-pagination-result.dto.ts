import { BasePaginationResultDto } from '../../../common/dto/base-pagination-result.dto';
import { GroupHistoryModel } from '../../entity/group-history.entity';

export interface GroupHistoryPaginationResultDto
  extends BasePaginationResultDto<GroupHistoryModel> {
  totalPage: number;
}
