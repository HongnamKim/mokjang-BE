import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { BaseOffsetPaginationRequestDto } from '../../../../../common/dto/request/base-offset-pagination-request.dto';
import { MinistryOrder } from '../../../const/ministry-order.enum';

export class GetMinistryDto extends BaseOffsetPaginationRequestDto<MinistryOrder> {
  /*@ApiProperty({
    description: '사역 그룹 ID ',
    required: true,
  })
  @IsNumber()
  @Min(1)
  ministryGroupId: number;*/

  @ApiProperty({
    description: '조회할 데이터 개수',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  override take: number = 20;

  @ApiProperty({
    description: '정렬 기준 (생성일, 수정일, 이름)',
    enum: MinistryOrder,
    default: MinistryOrder.CREATED_AT,
    required: false,
  })
  @IsEnum(MinistryOrder)
  @IsOptional()
  order: MinistryOrder = MinistryOrder.CREATED_AT;
}
