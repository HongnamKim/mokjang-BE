import { BasePostResponseDto } from '../../../../../common/dto/reponse/base-post-response.dto';
import { MinistryGroupModel } from '../../../entity/ministry-group.entity';

export class MinistryGroupPostResponseDto extends BasePostResponseDto<MinistryGroupModel> {
  constructor(data: MinistryGroupModel) {
    super(data);
  }
}
