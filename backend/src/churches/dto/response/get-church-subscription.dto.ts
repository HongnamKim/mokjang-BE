import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { SubscriptionModel } from '../../../subscription/entity/subscription.entity';

export class GetChurchSubscriptionDto extends BaseGetResponseDto<SubscriptionModel> {
  constructor(data: SubscriptionModel) {
    super(data);
  }
}
