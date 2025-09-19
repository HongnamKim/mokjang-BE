import { BasePostResponseDto } from '../../../common/dto/reponse/base-post-response.dto';
import { PaymentMethodDto } from '../payment-method.dto';

export class PostPaymentMethodResponseDto extends BasePostResponseDto<PaymentMethodDto> {
  constructor(data: PaymentMethodDto) {
    super(data);
  }
}
