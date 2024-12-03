import { ResponseDto } from './response.dto';

export class ResponsePaginationDto<T> extends ResponseDto {
  constructor(
    public data: T[],
    public count: number,
    public page: number,
    public totalCount: number,
    public totalPage: number,
  ) {
    super(new Date());
  }
}
