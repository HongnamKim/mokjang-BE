import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { IsYYYYMMDD } from '../../../../common/decorator/validator/is-yyyy-mm-dd.validator';

export class GetWorshipSessionDto {
  @ApiPropertyOptional({ description: '예배 세션 날짜(yyyy-MM-dd)' })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('sessionDate')
  sessionDate?: string;
}
