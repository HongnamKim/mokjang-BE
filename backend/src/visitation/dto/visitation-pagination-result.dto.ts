import { BaseOffsetPaginationResultDto } from '../../common/dto/base-offset-pagination-result.dto';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';

/*export interface VisitationPaginationResultDto
  extends BaseOffsetPaginationResultDto<VisitationMetaModel> {
  totalPage: number;
}*/

export class VisitationPaginationResultDto extends BaseOffsetPaginationResultDto<VisitationMetaModel> {
  constructor(
    public readonly data: VisitationMetaModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
