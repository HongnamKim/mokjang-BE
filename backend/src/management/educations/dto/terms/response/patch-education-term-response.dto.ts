import { BasePatchResponseDto } from '../../../../../common/dto/reponse/base-patch-response.dto';
import { EducationTermModel } from '../../../entity/education-term.entity';

export class PatchEducationTermResponseDto extends BasePatchResponseDto<EducationTermModel> {
  constructor(data: EducationTermModel) {
    super(data);
  }
}
