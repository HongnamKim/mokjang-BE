import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { WidgetRange } from '../../const/widget-range.enum';
import { IsYYYYMMDD } from '../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';

export class GetMyInChargedSchedulesDto {
  @ApiProperty({
    description: '검색 단위 (주간 / 월간)',
    enum: WidgetRange,
  })
  @IsEnum(WidgetRange)
  range: WidgetRange;

  @ApiProperty({
    description: '검색 시작일(YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('from')
  from?: string;

  @ApiProperty({
    description: '검색 종료일(YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsAfterDate('from')
  @IsYYYYMMDD('to')
  to?: string;
}
