import { BasePatchResponseDto } from '../../../../../common/dto/reponse/base-patch-response.dto';
import { MinistryGroupModel } from '../../../entity/ministry-group.entity';

export class MinistryGroupPatchResponseDto extends BasePatchResponseDto<MinistryGroupModel> {
  constructor(data: MinistryGroupModel, timestamp?: Date) {
    super(data, timestamp);
  }
}
