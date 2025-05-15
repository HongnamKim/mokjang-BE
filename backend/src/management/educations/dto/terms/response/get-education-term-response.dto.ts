import { BaseGetResponseDto } from '../../../../../common/dto/reponse/base-get-response.dto';
import { EducationTermModel } from '../../../entity/education-term.entity';

export class GetEducationTermResponseDto extends BaseGetResponseDto<EducationTermModel> {
  constructor(data: EducationTermModel) {
    super(data);
  }
}
