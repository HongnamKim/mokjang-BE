import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { ChurchJoinRequestModel } from '../../entity/church-join-request.entity';

/*export interface JoinRequestPaginationResult
  extends BaseOffsetPaginationResultDto<ChurchJoinRequestModel> {
  totalPage: number;
}*/

export class JoinRequestPaginationResult extends BaseOffsetPaginationResponseDto<ChurchJoinRequestModel> {
  constructor(
    public readonly data: ChurchJoinRequestModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
