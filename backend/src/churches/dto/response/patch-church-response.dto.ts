import { BasePatchResponseDto } from '../../../common/dto/reponse/base-patch-response.dto';
import { ChurchModel } from '../../entity/church.entity';

export class PatchChurchResponseDto extends BasePatchResponseDto<ChurchModel> {
  constructor(data: ChurchModel) {
    super(data);
  }
}
