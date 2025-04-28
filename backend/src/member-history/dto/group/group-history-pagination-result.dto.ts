import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { GroupHistoryModel } from '../../entity/group-history.entity';

/*export interface GroupHistoryPaginationResultDto
  extends BaseOffsetPaginationResultDto<GroupHistoryModel> {
  totalPage: number;
}*/

export class GroupHistoryPaginationResultDto extends BaseOffsetPaginationResponseDto<GroupHistoryModel> {
  constructor(
    public readonly data: GroupHistoryModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
