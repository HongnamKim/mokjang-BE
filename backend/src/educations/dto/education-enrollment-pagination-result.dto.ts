import { EducationEnrollmentModel } from '../entity/education-enrollment.entity';
import { BaseOffsetPaginationResponseDto } from '../../common/dto/reponse/base-offset-pagination-response.dto';

/*export interface EducationEnrollmentPaginationResultDto
  extends BaseOffsetPaginationResultDto<EducationEnrollmentModel> {}*/

export class EducationEnrollmentPaginationResultDto extends BaseOffsetPaginationResponseDto<EducationEnrollmentModel> {
  constructor(
    public readonly data: EducationEnrollmentModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
