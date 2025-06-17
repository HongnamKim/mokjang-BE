import { BasePostResponseDto } from '../../../../common/dto/reponse/base-post-response.dto';
import { WorshipModel } from '../../../entity/worship.entity';

export class PostWorshipResponseDto extends BasePostResponseDto<WorshipModel> {
  constructor(data: WorshipModel) {
    super(data);
  }
}
