import { BasePatchResponseDto } from '../../../../common/dto/reponse/base-patch-response.dto';
import { EducationModel } from '../../entity/education.entity';

export class PatchEducationResponseDto extends BasePatchResponseDto<EducationModel> {
  constructor(data: EducationModel) {
    super(data);
  }
}
