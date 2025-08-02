import { BasePatchResponseDto } from '../../../../common/dto/reponse/base-patch-response.dto';
import { EducationEnrollmentModel } from '../../entity/education-enrollment.entity';

export class PatchEducationEnrollmentResponseDto extends BasePatchResponseDto<EducationEnrollmentModel> {
  constructor(data: EducationEnrollmentModel) {
    super(data);
  }
}
