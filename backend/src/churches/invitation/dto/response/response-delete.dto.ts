import { ResponseDto } from './response.dto';

export class ResponseDeleteDto extends ResponseDto {
  constructor(
    public success: boolean,
    public resultId: number,
  ) {
    super(new Date());
  }
}
