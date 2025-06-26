import { BasePostResponseDto } from '../../../../common/dto/reponse/base-post-response.dto';
import { WorshipSessionModel } from '../../../entity/worship-session.entity';

export class PostWorshipSessionResponseDto extends BasePostResponseDto<WorshipSessionModel> {
  constructor(data: WorshipSessionModel) {
    super(data);
  }
}
