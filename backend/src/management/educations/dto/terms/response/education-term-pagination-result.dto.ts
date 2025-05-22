import { BaseOffsetPaginationResponseDto } from '../../../../../common/dto/reponse/base-offset-pagination-response.dto';
import { EducationTermModel } from '../../../entity/education-term.entity';

/*export interface EducationTermPaginationResultDto
  extends BaseOffsetPaginationResultDto<EducationTermModel> {
  totalPage: number;
}*/

export class EducationTermPaginationResultDto extends BaseOffsetPaginationResponseDto<EducationTermModel> {
  constructor(
    public readonly data: EducationTermModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
