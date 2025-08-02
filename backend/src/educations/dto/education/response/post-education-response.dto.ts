import { BasePostResponseDto } from '../../../../common/dto/reponse/base-post-response.dto';
import { EducationModel } from '../../../entity/education.entity';

export class PostEducationResponseDto extends BasePostResponseDto<EducationModel> {
  constructor(data: EducationModel) {
    super(data);
  }
}
