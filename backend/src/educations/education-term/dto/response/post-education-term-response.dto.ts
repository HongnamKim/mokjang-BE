import { EducationTermModel } from '../../entity/education-term.entity';
import { BasePostResponseDto } from '../../../../common/dto/reponse/base-post-response.dto';

export class PostEducationTermResponseDto extends BasePostResponseDto<EducationTermModel> {
  constructor(data: EducationTermModel) {
    super(data);
  }
}
