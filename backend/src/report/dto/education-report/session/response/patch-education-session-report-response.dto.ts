import { BasePatchResponseDto } from '../../../../../common/dto/reponse/base-patch-response.dto';
import { EducationSessionReportModel } from '../../../../entity/education-session-report.entity';

export class PatchEducationSessionReportResponseDto extends BasePatchResponseDto<EducationSessionReportModel> {
  constructor(data: EducationSessionReportModel) {
    super(data);
  }
}
