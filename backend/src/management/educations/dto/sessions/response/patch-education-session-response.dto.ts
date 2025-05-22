import { BasePatchResponseDto } from '../../../../../common/dto/reponse/base-patch-response.dto';
import { EducationSessionModel } from '../../../entity/education-session.entity';

export class PatchEducationSessionResponseDto extends BasePatchResponseDto<EducationSessionModel> {
  constructor(data: EducationSessionModel) {
    super(data);
  }
}
