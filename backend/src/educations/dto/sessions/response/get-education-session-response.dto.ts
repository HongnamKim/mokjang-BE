import { EducationSessionModel } from '../../../entity/education-session.entity';
import { BaseGetResponseDto } from '../../../../common/dto/reponse/base-get-response.dto';

export class GetEducationSessionResponseDto extends BaseGetResponseDto<EducationSessionModel> {
  constructor(data: EducationSessionModel) {
    super(data);
  }
}
