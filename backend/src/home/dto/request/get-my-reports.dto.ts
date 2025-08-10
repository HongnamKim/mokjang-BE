import { ApiProperty } from '@nestjs/swagger';
import { WidgetRange } from '../../const/widget-range.enum';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { IsYYYYMMDD } from '../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';

export class GetMyReportsDto {
  @ApiProperty({
    description: '검색 단위 (주간 / 월간)',
    enum: WidgetRange,
  })
  @IsEnum(WidgetRange)
  range: WidgetRange;

  @ApiProperty({
    description: '조회할 페이지',
    default: 1,
  })
  @IsNumber()
  page: number = 1;

  @ApiProperty({
    description: '요청 데이터 개수',
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take: number = 20;

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
