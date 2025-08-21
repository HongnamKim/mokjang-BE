import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';
import { IsYYYYMMDD } from '../../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { IsAfterDate } from '../../../../common/decorator/validator/is-after-date.decorator';

export class GetWorshipStatsDto {
  @ApiProperty({ description: '출석률 집계 시작' })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('from')
  from: string;

  utcFrom: Date;

  @ApiProperty({ description: '출석률 집계 끝' })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('to')
  @IsAfterDate('from')
  to: string;

  utcTo: Date;

  @ApiPropertyOptional({ description: '조회할 그룹' })
  @IsOptional()
  @IsNumber()
  groupId?: number;
}
