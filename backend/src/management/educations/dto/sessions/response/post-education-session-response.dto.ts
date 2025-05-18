import { BasePostResponseDto } from '../../../../../common/dto/reponse/base-post-response.dto';
import { EducationSessionModel } from '../../../entity/education-session.entity';

export class PostEducationSessionResponseDto extends BasePostResponseDto<EducationSessionModel> {
  constructor(data: EducationSessionModel) {
    super(data);
  }
}
