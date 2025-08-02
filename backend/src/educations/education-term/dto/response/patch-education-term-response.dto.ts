import { EducationTermModel } from '../../entity/education-term.entity';
import { BasePatchResponseDto } from '../../../../common/dto/reponse/base-patch-response.dto';

export class PatchEducationTermResponseDto extends BasePatchResponseDto<EducationTermModel> {
  constructor(data: EducationTermModel) {
    super(data);
  }
}
