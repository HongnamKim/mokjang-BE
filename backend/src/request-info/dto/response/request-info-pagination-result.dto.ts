import { BasePaginationResultDto } from '../../../common/dto/base-pagination-result.dto';
import { RequestInfoModel } from '../../entity/request-info.entity';

export interface RequestInfoPaginationResultDto
  extends BasePaginationResultDto<RequestInfoModel> {
  totalPage: number;
}
