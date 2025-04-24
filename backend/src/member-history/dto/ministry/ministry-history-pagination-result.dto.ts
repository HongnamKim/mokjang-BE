import { BaseOffsetPaginationResultDto } from '../../../common/dto/base-offset-pagination-result.dto';
import { MinistryHistoryModel } from '../../entity/ministry-history.entity';

/*export interface MinistryHistoryPaginationResult
  extends BaseOffsetPaginationResultDto<MinistryHistoryModel> {
  totalPage: number;
}*/

export class MinistryHistoryPaginationResultDto extends BaseOffsetPaginationResultDto<MinistryHistoryModel> {
  constructor(
    public readonly data: MinistryHistoryModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
