import { BasePatchResponseDto } from '../../../../common/dto/reponse/base-patch-response.dto';
import { OfficerHistoryModel } from '../../entity/officer-history.entity';

export class PatchOfficerHistoryResponseDto extends BasePatchResponseDto<OfficerHistoryModel> {
  constructor(data: OfficerHistoryModel) {
    super(data);
  }
}
