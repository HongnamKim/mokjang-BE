import { EducationSessionModel } from '../../entity/education-session.entity';
import { BasePatchResponseDto } from '../../../../common/dto/reponse/base-patch-response.dto';

export class PatchEducationSessionResponseDto extends BasePatchResponseDto<EducationSessionModel> {
  constructor(data: EducationSessionModel) {
    super(data);
  }
}
