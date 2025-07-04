import { BasePatchResponseDto } from '../../../../common/dto/reponse/base-patch-response.dto';
import { ChurchEventModel } from '../../../entity/church-event.entity';

export class PatchChurchEventResponseDto extends BasePatchResponseDto<ChurchEventModel> {
  constructor(data: ChurchEventModel) {
    super(data);
  }
}
