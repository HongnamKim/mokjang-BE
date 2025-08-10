import { EducationTermModel } from '../../entity/education-term.entity';
import { BaseGetResponseDto } from '../../../../common/dto/reponse/base-get-response.dto';

export class GetEducationTermResponseDto extends BaseGetResponseDto<EducationTermModel> {
  constructor(data: EducationTermModel) {
    super(data);
  }
}
