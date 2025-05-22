import { BasePostResponseDto } from '../../../../../common/dto/reponse/base-post-response.dto';
import { EducationTermModel } from '../../../entity/education-term.entity';

export class PostEducationTermResponseDto extends BasePostResponseDto<EducationTermModel> {
  constructor(data: EducationTermModel) {
    super(data);
  }
}
