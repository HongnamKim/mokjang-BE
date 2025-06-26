import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { MemberModel } from '../../entity/member.entity';

/*export interface MemberPaginationResultDto
  extends BaseOffsetPaginationResultDto<MemberModel> {
  totalPage: number;
}*/

export class MemberPaginationResponseDto extends BaseOffsetPaginationResponseDto<MemberModel> {
  constructor(
    public readonly data: MemberModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
