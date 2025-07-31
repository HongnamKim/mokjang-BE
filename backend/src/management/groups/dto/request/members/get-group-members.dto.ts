import { BaseOffsetPaginationRequestDto } from '../../../../../common/dto/request/base-offset-pagination-request.dto';
import { GroupMemberOrder } from '../../../const/group-member-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class GetGroupMembersDto extends BaseOffsetPaginationRequestDto<GroupMemberOrder> {
  @ApiProperty({
    description: '조회할 데이터 수',
    default: 20,
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  override take: number = 20;

  @ApiProperty({
    description: '정렬 기준',
    enum: GroupMemberOrder,
    default: GroupMemberOrder.REGISTERED_AT,
  })
  @IsOptional()
  @IsEnum(GroupMemberOrder)
  order: GroupMemberOrder = GroupMemberOrder.REGISTERED_AT;
}
