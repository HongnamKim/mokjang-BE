import { EducationSessionModel } from '../../../entity/education-session.entity';
import { BaseOffsetPaginationResponseDto } from '../../../../common/dto/reponse/base-offset-pagination-response.dto';

export class EducationSessionPaginationResponseDto extends BaseOffsetPaginationResponseDto<EducationSessionModel> {
  constructor(
    data: EducationSessionModel[],
    totalCount: number,
    count: number,
    page: number,
    totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
