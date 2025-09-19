import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { OfficerOrderEnum } from '../../const/officer-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class GetOfficersDto extends BaseOffsetPaginationRequestDto<OfficerOrderEnum> {
  @ApiProperty({
    description: '정렬 기준 (지정 순서, 생성일, 수정일, 이름)',
    enum: OfficerOrderEnum,
    default: OfficerOrderEnum.order,
    required: false,
  })
  @IsEnum(OfficerOrderEnum)
  @IsOptional()
  order: OfficerOrderEnum = OfficerOrderEnum.order;
}
