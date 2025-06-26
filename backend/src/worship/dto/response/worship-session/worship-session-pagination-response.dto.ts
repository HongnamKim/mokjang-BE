import { BaseOffsetPaginationResponseDto } from '../../../../common/dto/reponse/base-offset-pagination-response.dto';
import { WorshipSessionModel } from '../../../entity/worship-session.entity';

export class WorshipSessionPaginationResponseDto extends BaseOffsetPaginationResponseDto<WorshipSessionModel> {
  constructor(
    data: WorshipSessionModel[],
    totalCount: number,
    count: number,
    page: number,
    totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
