import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { WorshipSessionOrderEnum } from '../../../const/worship-session-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class GetWorshipSessionsDto extends BaseOffsetPaginationRequestDto<WorshipSessionOrderEnum> {
  @ApiProperty({
    description: '정렬 기준',
    enum: WorshipSessionOrderEnum,
    default: WorshipSessionOrderEnum.SESSION_DATE,
    required: false,
  })
  @IsOptional()
  @IsEnum(WorshipSessionOrderEnum)
  order: WorshipSessionOrderEnum = WorshipSessionOrderEnum.SESSION_DATE;
}
