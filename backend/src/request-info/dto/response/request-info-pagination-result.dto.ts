import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { RequestInfoModel } from '../../entity/request-info.entity';

/*export interface RequestInfoPaginationResultDto
  extends BaseOffsetPaginationResultDto<RequestInfoModel> {
  totalPage: number;
}*/

export class RequestInfoPaginationResultDto extends BaseOffsetPaginationResponseDto<RequestInfoModel> {
  constructor(
    public readonly data: RequestInfoModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
