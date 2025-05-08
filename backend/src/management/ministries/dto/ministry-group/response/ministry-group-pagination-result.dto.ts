import { BaseOffsetPaginationResponseDto } from '../../../../../common/dto/reponse/base-offset-pagination-response.dto';
import { MinistryGroupModel } from '../../../entity/ministry-group.entity';

export class MinistryGroupPaginationResultDto extends BaseOffsetPaginationResponseDto<MinistryGroupModel> {
  constructor(
    data: MinistryGroupModel[],
    totalCount: number,
    count: number,
    page: number,
    totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
