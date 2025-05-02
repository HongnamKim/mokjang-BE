import { OfficerModel } from '../../entity/officer.entity';
import { BaseOffsetPaginationResponseDto } from '../../../../common/dto/reponse/base-offset-pagination-response.dto';

export class OfficerPaginationResponseDto extends BaseOffsetPaginationResponseDto<OfficerModel> {
  constructor(
    public readonly data: OfficerModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
