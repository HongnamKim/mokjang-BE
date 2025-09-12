import { BaseCursorPaginationResponseDto } from '../../../common/dto/base-cursor-pagination-response.dto';
import { NotificationModel } from '../../entity/notification.entity';

export class GetNotificationListResponseDto extends BaseCursorPaginationResponseDto<NotificationModel> {
  constructor(
    data: NotificationModel[],
    count: number,
    nextCursor: string | undefined,
    hasMore: boolean,
  ) {
    super(data, count, nextCursor, hasMore);
  }
}
