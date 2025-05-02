import { BasePatchResponseDto } from '../../../../common/dto/reponse/base-patch-response.dto';
import { OfficerModel } from '../../entity/officer.entity';

export class OfficerPatchResponse extends BasePatchResponseDto<OfficerModel> {
  constructor(public readonly data: OfficerModel) {
    super(data);
  }
}
