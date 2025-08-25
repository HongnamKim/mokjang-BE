import { ApiProperty } from '@nestjs/swagger';
import { WidgetRange } from '../../const/widget-range.enum';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { IsYYYYMMDD } from '../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';
import { ScheduleStatusOption } from '../../const/schedule-status-option.enum';

export class GetScheduleStatusDto {
  @ApiProperty({
    description: '검색 단위 (주간 / 월간)',
    enum: WidgetRange,
  })
  @IsEnum(WidgetRange)
  range: WidgetRange;

  @ApiProperty({
    description: '검색 범위(교회 / 개인)',
    enum: ScheduleStatusOption,
    default: ScheduleStatusOption.CHURCH,
  })
  @IsEnum(ScheduleStatusOption)
  option: ScheduleStatusOption = ScheduleStatusOption.CHURCH;

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
