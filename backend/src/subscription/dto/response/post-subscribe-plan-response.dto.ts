import { BasePostResponseDto } from '../../../common/dto/reponse/base-post-response.dto';
import { SubscriptionModel } from '../../entity/subscription.entity';

export class PostSubscribePlanResponseDto extends BasePostResponseDto<SubscriptionModel> {
  constructor(data: SubscriptionModel) {
    super(data);
  }
}
