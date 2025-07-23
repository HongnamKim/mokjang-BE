import { BaseOffsetPaginationRequestDto } from '../../../../../common/dto/request/base-offset-pagination-request.dto';
import { OfficerMemberOrder } from '../../../const/officer-member-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class GetOfficerMembersDto extends BaseOffsetPaginationRequestDto<OfficerMemberOrder> {
  @ApiProperty({
    description: '조회할 데이터 수',
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  override take: number = 20;

  @ApiProperty({
    description: '정렬 조건',
    enum: OfficerMemberOrder,
    required: false,
    default: OfficerMemberOrder.REGISTERED_AT,
  })
  @IsOptional()
  @IsEnum(OfficerMemberOrder)
  order: OfficerMemberOrder = OfficerMemberOrder.REGISTERED_AT;
}
