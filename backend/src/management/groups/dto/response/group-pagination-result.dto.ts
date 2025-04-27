import { BaseOffsetPaginationResultDto } from '../../../../common/dto/base-offset-pagination-result.dto';
import { GroupModel } from '../../entity/group.entity';

export class GroupPaginationResultDto extends BaseOffsetPaginationResultDto<GroupModel> {
  constructor(
    public readonly data: GroupModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
