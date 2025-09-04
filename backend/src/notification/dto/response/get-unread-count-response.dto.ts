import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';

export class GetUnreadCountResponseDto extends BaseGetResponseDto<number> {
  constructor(data: number) {
    super(data);
  }
}
