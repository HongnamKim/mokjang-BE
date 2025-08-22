import { BasePatchResponseDto } from '../../common/dto/reponse/base-patch-response.dto';
import { FamilyRelationModel } from '../entity/family-relation.entity';

export class PatchFamilyRelationResponseDto extends BasePatchResponseDto<FamilyRelationModel> {
  constructor(data: FamilyRelationModel) {
    super(data);
  }
}
