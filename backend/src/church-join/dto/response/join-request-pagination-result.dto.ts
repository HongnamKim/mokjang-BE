import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { ChurchJoinModel } from '../../entity/church-join.entity';

export class JoinRequestPaginationResult extends BaseOffsetPaginationResponseDto<ChurchJoinModel> {
  constructor(
    public readonly data: ChurchJoinModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
