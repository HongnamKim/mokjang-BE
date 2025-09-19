import { ResponseDto } from './response.dto';

export class ResponseValidateRequestInfoDto extends ResponseDto {
  constructor(success: boolean) {
    super(new Date());
    this.success = success;
  }

  success: boolean;
}
