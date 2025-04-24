import { BaseOffsetPaginationResultDto } from '../../../common/dto/base-offset-pagination-result.dto';
import { EducationTermModel } from '../entity/education-term.entity';

/*export interface EducationTermPaginationResultDto
  extends BaseOffsetPaginationResultDto<EducationTermModel> {
  totalPage: number;
}*/

export class EducationTermPaginationResultDto extends BaseOffsetPaginationResultDto<EducationTermModel> {
  constructor(
    public readonly data: EducationTermModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
