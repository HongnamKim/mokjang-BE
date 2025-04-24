import { BaseOffsetPaginationResultDto } from '../../../common/dto/base-offset-pagination-result.dto';
import { GroupHistoryModel } from '../../entity/group-history.entity';

/*export interface GroupHistoryPaginationResultDto
  extends BaseOffsetPaginationResultDto<GroupHistoryModel> {
  totalPage: number;
}*/

export class GroupHistoryPaginationResultDto extends BaseOffsetPaginationResultDto<GroupHistoryModel> {
  constructor(
    public readonly data: GroupHistoryModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
