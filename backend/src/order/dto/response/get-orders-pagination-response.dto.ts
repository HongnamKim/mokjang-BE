import { BaseCursorPaginationResponseDto } from '../../../common/dto/base-cursor-pagination-response.dto';
import { OrderModel } from '../../entity/order.entity';

export class GetOrdersPaginationResponseDto extends BaseCursorPaginationResponseDto<OrderModel> {
  constructor(
    data: OrderModel[],
    count: number,
    nextCursor: string | undefined,
    hasMore: boolean,
  ) {
    super(data, count, nextCursor, hasMore);
  }
}
