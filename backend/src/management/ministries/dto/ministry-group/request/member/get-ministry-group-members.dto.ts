import { ApiProperty } from '@nestjs/swagger';
import { BaseOffsetPaginationRequestDto } from '../../../../../../common/dto/request/base-offset-pagination-request.dto';
import { MinistryGroupMemberOrder } from '../../../../const/ministry-group-member-order.enum';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class GetMinistryGroupMembersDto extends BaseOffsetPaginationRequestDto<MinistryGroupMemberOrder> {
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
    enum: MinistryGroupMemberOrder,
    default: MinistryGroupMemberOrder.REGISTERED_AT,
    required: false,
  })
  @IsOptional()
  @IsEnum(MinistryGroupMemberOrder)
  order: MinistryGroupMemberOrder = MinistryGroupMemberOrder.REGISTERED_AT;
}
