import { BaseCursorPaginationRequestDto } from '../../../common/dto/request/base-cursor-pagination-request.dto';
import { OrderSortColumn } from '../../const/order-order.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class GetOrdersDto extends BaseCursorPaginationRequestDto<OrderSortColumn> {
  @ApiPropertyOptional({
    enum: OrderSortColumn,
    default: OrderSortColumn.ORDERED_AT,
  })
  @IsEnum(OrderSortColumn)
  sortBy: OrderSortColumn = OrderSortColumn.ORDERED_AT;
}
