import { BaseOffsetPaginationResultDto } from '../../../common/dto/base-offset-pagination-result.dto';
import { OfficerHistoryModel } from '../../entity/officer-history.entity';

/*export interface OfficerHistoryPaginationResultDto
  extends BaseOffsetPaginationResultDto<OfficerHistoryModel> {
  totalPage: number;
}*/

export class OfficerHistoryPaginationResultDto extends BaseOffsetPaginationResultDto<OfficerHistoryModel> {
  constructor(
    public readonly data: OfficerHistoryModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
