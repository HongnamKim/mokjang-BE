import { BaseGetResponseDto } from '../../../../../common/dto/reponse/base-get-response.dto';
import { EducationSessionModel } from '../../../entity/education-session.entity';

export class GetEducationSessionResponseDto extends BaseGetResponseDto<EducationSessionModel> {
  constructor(data: EducationSessionModel) {
    super(data);
  }
}
