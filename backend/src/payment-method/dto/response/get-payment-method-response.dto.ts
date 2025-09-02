import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { PaymentMethodDto } from '../payment-method.dto';

export class GetPaymentMethodResponseDto extends BaseGetResponseDto<PaymentMethodDto> {
  constructor(data: PaymentMethodDto) {
    super(data);
  }
}
