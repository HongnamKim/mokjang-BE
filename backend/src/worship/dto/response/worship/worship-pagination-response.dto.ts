import { BaseOffsetPaginationResponseDto } from '../../../../common/dto/reponse/base-offset-pagination-response.dto';
import { WorshipModel } from '../../../entity/worship.entity';

export class WorshipPaginationResponseDto extends BaseOffsetPaginationResponseDto<WorshipModel> {
  constructor(
    data: WorshipModel[],
    totalCount: number,
    count: number,
    page: number,
    totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
