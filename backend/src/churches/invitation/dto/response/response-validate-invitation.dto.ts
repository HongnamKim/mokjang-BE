import { ResponseDto } from './response.dto';

export class ResponseValidateInvitationDto extends ResponseDto {
  constructor(success: boolean) {
    super(new Date());
    this.success = success;
  }

  success: boolean;
}
