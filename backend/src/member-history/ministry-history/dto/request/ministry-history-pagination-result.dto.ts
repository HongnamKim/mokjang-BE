import { BaseOffsetPaginationResponseDto } from '../../../../common/dto/reponse/base-offset-pagination-response.dto';
import { MinistryHistoryModel } from '../../entity/ministry-history.entity';

export class MinistryHistoryPaginationResultDto extends BaseOffsetPaginationResponseDto<MinistryHistoryModel> {
  constructor(
    public readonly data: MinistryHistoryModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
