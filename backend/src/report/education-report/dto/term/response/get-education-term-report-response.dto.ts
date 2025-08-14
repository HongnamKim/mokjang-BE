import { BaseGetResponseDto } from '../../../../../common/dto/reponse/base-get-response.dto';
import { EducationReportModel } from '../../../entity/education-report.entity';

export class GetEducationTermReportResponseDto extends BaseGetResponseDto<EducationReportModel> {
  constructor(data: EducationReportModel) {
    super(data);
  }
}
