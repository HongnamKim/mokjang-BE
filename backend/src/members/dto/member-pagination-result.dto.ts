import { BaseOffsetPaginationResultDto } from '../../common/dto/base-offset-pagination-result.dto';
import { MemberModel } from '../entity/member.entity';

/*export interface MemberPaginationResultDto
  extends BaseOffsetPaginationResultDto<MemberModel> {
  totalPage: number;
}*/

export class MemberPaginationResultDto extends BaseOffsetPaginationResultDto<MemberModel> {
  constructor(
    public readonly data: MemberModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
