import { WidgetRange } from '../../const/widget-range.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';
import { IsYYYYMMDD } from '../../../common/decorator/validator/is-yyyy-mm-dd.validator';

export class GetNewMemberSummaryDto {
  @ApiProperty({
    description: '신규 교인 검색 단위 범위',
    enum: WidgetRange,
    default: WidgetRange.WEEKLY,
  })
  @IsEnum(WidgetRange)
  range: WidgetRange = WidgetRange.WEEKLY;

  @ApiProperty({
    description: '등록기간 시작 날짜 (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('from')
  from?: string;

  @ApiProperty({
    description: '등록기간 종료 날짜 (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('to')
  @IsAfterDate('from')
  to?: string;
}
