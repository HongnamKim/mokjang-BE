import { BaseOffsetPaginationRequestDto } from '../../../../../common/dto/request/base-offset-pagination-request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import { UnassignedMemberOrder } from '../../../const/unassigned-member-order.enum';

export class GetUnassignedMembersDto extends BaseOffsetPaginationRequestDto<UnassignedMemberOrder> {
  @ApiProperty({
    description: '정렬 조건 (등록일 고정)',
    enum: UnassignedMemberOrder,
    default: UnassignedMemberOrder.REGISTERED_AT,
    required: false,
  })
  @IsOptional()
  @IsEnum(UnassignedMemberOrder)
  order: UnassignedMemberOrder = UnassignedMemberOrder.REGISTERED_AT;

  @ApiProperty({
    description: '조회할 데이터 개수',
    default: 20,
    example: 20,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  override take: number = 20;

  @ApiProperty({
    name: 'orderDirection',
    description: '정렬 오름차순 / 내림차순',
    default: 'desc',
    required: false,
  })
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @IsOptional()
  orderDirection: 'ASC' | 'DESC' | 'asc' | 'desc' = 'desc';
}
