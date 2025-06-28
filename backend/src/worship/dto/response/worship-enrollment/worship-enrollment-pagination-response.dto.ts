import { BaseOffsetPaginationResponseDto } from '../../../../common/dto/reponse/base-offset-pagination-response.dto';
import { WorshipEnrollmentModel } from '../../../entity/worship-enrollment.entity';

export class WorshipEnrollmentPaginationResponseDto extends BaseOffsetPaginationResponseDto<WorshipEnrollmentModel> {
  constructor(
    data: WorshipEnrollmentModel[],
    totalCount: number,
    count: number,
    page: number,
    totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
