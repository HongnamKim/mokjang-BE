import { BaseOffsetPaginationRequestDto } from '../../../../../common/dto/request/base-offset-pagination-request.dto';
import { MinistryGroupOrderEnum } from '../../../const/ministry-group-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class GetMinistryGroupDto extends BaseOffsetPaginationRequestDto<MinistryGroupOrderEnum> {
  @ApiProperty({
    description: '부모 그룹 ID (값이 없을 경우 최상위 사역 그룹 조회)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parentMinistryGroupId: number = 0;

  @ApiProperty({
    description: '정렬 기준 (생성일, 수정일, 이름)',
    enum: MinistryGroupOrderEnum,
    default: MinistryGroupOrderEnum.ORDER,
    required: false,
  })
  @IsEnum(MinistryGroupOrderEnum)
  @IsOptional()
  order: MinistryGroupOrderEnum = MinistryGroupOrderEnum.ORDER;
}
