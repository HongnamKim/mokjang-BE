import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { EducationModel } from '../entity/education.entity';

/*export interface EducationPaginationResultDto
  extends BaseOffsetPaginationResultDto<EducationModel> {
  totalPage: number;
}*/

export class EducationPaginationResultDto extends BaseOffsetPaginationResponseDto<EducationModel> {
  constructor(
    public readonly data: EducationModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
