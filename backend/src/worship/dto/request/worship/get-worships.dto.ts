import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { WorshipOrderEnum } from '../../../const/worship-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';

export class GetWorshipsDto extends BaseOffsetPaginationRequestDto<WorshipOrderEnum> {
  @ApiProperty({
    description: '정렬 조건',
    enum: WorshipOrderEnum,
    default: WorshipOrderEnum.CREATED_AT,
    required: false,
  })
  @IsOptionalNotNull()
  @IsEnum(WorshipOrderEnum)
  order: WorshipOrderEnum = WorshipOrderEnum.CREATED_AT;
}
