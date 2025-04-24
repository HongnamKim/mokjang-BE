import { BaseOffsetPaginationResultDto } from '../../../common/dto/base-offset-pagination-result.dto';
import { RequestInfoModel } from '../../entity/request-info.entity';

/*export interface RequestInfoPaginationResultDto
  extends BaseOffsetPaginationResultDto<RequestInfoModel> {
  totalPage: number;
}*/

export class RequestInfoPaginationResultDto extends BaseOffsetPaginationResultDto<RequestInfoModel> {
  constructor(
    public readonly data: RequestInfoModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
