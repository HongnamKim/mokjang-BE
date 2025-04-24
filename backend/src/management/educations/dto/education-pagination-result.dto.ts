import { BaseOffsetPaginationResultDto } from '../../../common/dto/base-offset-pagination-result.dto';
import { EducationModel } from '../entity/education.entity';

/*export interface EducationPaginationResultDto
  extends BaseOffsetPaginationResultDto<EducationModel> {
  totalPage: number;
}*/

export class EducationPaginationResultDto extends BaseOffsetPaginationResultDto<EducationModel> {
  constructor(
    public readonly data: EducationModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
