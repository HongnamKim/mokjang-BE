import { BaseOffsetPaginationResponseDto } from '../../../../../common/dto/reponse/base-offset-pagination-response.dto';
import { MinistryModel } from '../../../entity/ministry.entity';

export class MinistryOffsetPaginationResponseDto extends BaseOffsetPaginationResponseDto<MinistryModel> {
  constructor(
    public readonly data: MinistryModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
