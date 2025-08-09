import { BaseGetResponseDto } from '../../../../../common/dto/reponse/base-get-response.dto';
import { EducationSessionReportModel } from '../../../entity/education-session-report.entity';

export class GetEducationSessionReportResponseDto extends BaseGetResponseDto<EducationSessionReportModel> {
  constructor(data: EducationSessionReportModel) {
    super(data);
  }
}
