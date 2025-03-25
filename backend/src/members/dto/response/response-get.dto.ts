import { ResponseDto } from './response.dto';

export class ResponseGetDto<T> extends ResponseDto {
  constructor(public data: T) {
    super(new Date());
  }
}
