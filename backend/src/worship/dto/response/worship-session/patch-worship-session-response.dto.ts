import { BasePatchResponseDto } from '../../../../common/dto/reponse/base-patch-response.dto';
import { WorshipSessionModel } from '../../../entity/worship-session.entity';

export class PatchWorshipSessionResponseDto extends BasePatchResponseDto<WorshipSessionModel> {
  constructor(data: WorshipSessionModel) {
    super(data);
  }
}
