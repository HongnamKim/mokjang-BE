import { BaseOffsetPaginationResultDto } from '../../../common/dto/base-offset-pagination-result.dto';
import { EducationEnrollmentModel } from '../entity/education-enrollment.entity';

/*export interface EducationEnrollmentPaginationResultDto
  extends BaseOffsetPaginationResultDto<EducationEnrollmentModel> {}*/

export class EducationEnrollmentPaginationResultDto extends BaseOffsetPaginationResultDto<EducationEnrollmentModel> {
  constructor(
    public readonly data: EducationEnrollmentModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
