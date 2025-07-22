import { BasePatchResponseDto } from '../../../../../common/dto/reponse/base-patch-response.dto';
import { MinistryGroupHistoryModel } from '../../../entity/ministry-group-history.entity';

export class PatchMinistryGroupHistoryResponseDto extends BasePatchResponseDto<MinistryGroupHistoryModel> {
  constructor(data: MinistryGroupHistoryModel) {
    super(data);
  }
}
