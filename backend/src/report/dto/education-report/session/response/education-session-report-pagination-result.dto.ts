import { BaseOffsetPaginationResponseDto } from '../../../../../common/dto/reponse/base-offset-pagination-response.dto';
import { EducationSessionReportModel } from '../../../../entity/education-session-report.entity';

export class EducationSessionReportPaginationResultDto extends BaseOffsetPaginationResponseDto<EducationSessionReportModel> {
  constructor(
    data: EducationSessionReportModel[],
    totalCount: number,
    count: number,
    page: number,
    totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
