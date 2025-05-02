import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { MinistryOrderEnum } from '../../const/ministry-order.enum';

export class GetMinistryDto extends BaseOffsetPaginationRequestDto<MinistryOrderEnum> {
  @ApiProperty({
    description:
      '사역 그룹 ID (값이 없을 경우 사역 그룹에 속하지 않은 사역 조회)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  ministryGroupId: number = 0;

  @ApiProperty({
    description: '정렬 기준 (생성일, 수정일, 이름)',
    enum: MinistryOrderEnum,
    default: MinistryOrderEnum.createdAt,
    required: false,
  })
  @IsEnum(MinistryOrderEnum)
  @IsOptional()
  order: MinistryOrderEnum = MinistryOrderEnum.createdAt;
}
