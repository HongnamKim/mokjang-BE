import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

export class ManagerPaginationResponseDto extends BaseOffsetPaginationResponseDto<ChurchUserModel> {
  constructor(
    data: ChurchUserModel[],
    totalCount: number,
    count: number,
    page: number,
    totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
