import { BasePatchResponseDto } from '../../../../../common/dto/reponse/base-patch-response.dto';
import { EducationReportModel } from '../../../entity/education-report.entity';

export class PatchEducationTermReportResponseDto extends BasePatchResponseDto<EducationReportModel> {
  constructor(data: EducationReportModel) {
    super(data);
  }
}
