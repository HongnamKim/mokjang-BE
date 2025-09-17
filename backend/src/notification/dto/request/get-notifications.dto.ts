import { BaseCursorPaginationRequestDto } from '../../../common/dto/request/base-cursor-pagination-request.dto';
import { NotificationOrder } from '../../const/notification-order.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { QueryBoolean } from '../../../common/decorator/transformer/query-boolean.decorator';

export class GetNotificationsDto extends BaseCursorPaginationRequestDto<NotificationOrder> {
  @ApiPropertyOptional({
    description: '정렬 기준',
    enum: NotificationOrder,
    default: NotificationOrder.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(NotificationOrder)
  sortBy: NotificationOrder = NotificationOrder.CREATED_AT;

  @ApiPropertyOptional({ description: '읽지 않음 필터링' })
  @IsOptional()
  @IsBoolean()
  @QueryBoolean()
  unread: boolean;
}
