import { BasePatchResponseDto } from '../../../../common/dto/reponse/base-patch-response.dto';
import { WorshipModel } from '../../../entity/worship.entity';

export class PatchWorshipResponseDto extends BasePatchResponseDto<WorshipModel> {
  constructor(data: WorshipModel) {
    super(data);
  }
}
