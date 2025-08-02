import { EducationSessionModel } from '../../../entity/education-session.entity';
import { BasePostResponseDto } from '../../../../common/dto/reponse/base-post-response.dto';

export class PostEducationSessionResponseDto extends BasePostResponseDto<EducationSessionModel> {
  constructor(data: EducationSessionModel) {
    super(data);
  }
}
