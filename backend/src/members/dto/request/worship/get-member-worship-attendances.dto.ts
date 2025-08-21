import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Equals,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { IsYYYYMMDD } from '../../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { IsAfterDate } from '../../../../common/decorator/validator/is-after-date.decorator';
import { BaseCursorPaginationRequestDto } from '../../../../common/dto/request/base-cursor-pagination-request.dto';
import { WorshipAttendanceSortColumn } from '../../../../worship/const/worship-attendance-sort-column.enum';

export class GetMemberWorshipAttendancesDto extends BaseCursorPaginationRequestDto<WorshipAttendanceSortColumn> {
  @ApiPropertyOptional({
    description: '정렬 기준 (예배 세션 날짜 고정)',
  })
  @IsOptional()
  @IsEnum(WorshipAttendanceSortColumn)
  @Equals(WorshipAttendanceSortColumn.SESSION_DATE)
  sortBy: WorshipAttendanceSortColumn =
    WorshipAttendanceSortColumn.SESSION_DATE;

  @ApiProperty({ description: '예배 ID' })
  @IsNumber()
  worshipId: number;

  @ApiPropertyOptional({
    description: '날짜 범위 시작 (yyyy-MM-dd)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('from')
  from: string;

  utcFrom: Date;

  @ApiPropertyOptional({
    description: '날짜 범위 끝 (yyyy-MM-dd)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('to')
  @IsAfterDate('from')
  to: string;

  utcTo: Date;
}
