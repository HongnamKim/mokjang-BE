import { BaseOffsetPaginationResultDto } from '../../../common/dto/base-offset-pagination-result.dto';
import { ChurchJoinRequestModel } from '../../entity/church-join-request.entity';

/*export interface JoinRequestPaginationResult
  extends BaseOffsetPaginationResultDto<ChurchJoinRequestModel> {
  totalPage: number;
}*/

export class JoinRequestPaginationResult extends BaseOffsetPaginationResultDto<ChurchJoinRequestModel> {
  constructor(
    public readonly data: ChurchJoinRequestModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
