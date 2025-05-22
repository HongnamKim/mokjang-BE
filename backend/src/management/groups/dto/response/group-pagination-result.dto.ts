import { BaseOffsetPaginationResponseDto } from '../../../../common/dto/reponse/base-offset-pagination-response.dto';
import { GroupModel } from '../../entity/group.entity';

export class GroupPaginationResultDto extends BaseOffsetPaginationResponseDto<GroupModel> {
  constructor(
    public readonly data: GroupModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
