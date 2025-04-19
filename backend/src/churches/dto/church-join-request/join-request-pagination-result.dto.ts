import { BasePaginationResultDto } from '../../../common/dto/base-pagination-result.dto';
import { ChurchJoinRequestModel } from '../../entity/church-join-request.entity';

export interface JoinRequestPaginationResult
  extends BasePaginationResultDto<ChurchJoinRequestModel> {
  totalPage: number;
}
