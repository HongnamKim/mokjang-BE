import { BasePostResponseDto } from '../../../common/dto/reponse/base-post-response.dto';

export class RegisterDeviceResponseDto extends BasePostResponseDto<'ok'> {
  constructor(data: 'ok') {
    super(data);
  }
}
