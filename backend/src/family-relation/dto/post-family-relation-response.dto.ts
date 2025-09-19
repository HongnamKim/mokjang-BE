import { BasePostResponseDto } from '../../common/dto/reponse/base-post-response.dto';
import { FamilyRelationModel } from '../entity/family-relation.entity';

export class PostFamilyRelationResponseDto extends BasePostResponseDto<FamilyRelationModel> {
  constructor(data: FamilyRelationModel) {
    super(data);
  }
}
