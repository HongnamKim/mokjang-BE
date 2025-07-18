import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { GroupMemberOrder } from '../../const/group-member-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class GetGroupMembersDto extends BaseOffsetPaginationRequestDto<GroupMemberOrder> {
  @ApiProperty({
    description: '정렬 기준',
    enum: GroupMemberOrder,
    default: GroupMemberOrder.ID,
  })
  @IsEnum(GroupMemberOrder)
  order: GroupMemberOrder = GroupMemberOrder.ID;
}
