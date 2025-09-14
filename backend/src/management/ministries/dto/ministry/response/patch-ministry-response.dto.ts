import { BasePatchResponseDto } from '../../../../../common/dto/reponse/base-patch-response.dto';
import { MinistryModel } from '../../../entity/ministry.entity';

export class PatchMinistryResponseDto extends BasePatchResponseDto<MinistryModel> {
  constructor(public readonly data: MinistryModel) {
    super(data);
  }
}
