import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { IsOptionalNotNull } from '../../../../../common/decorator/validator/is-optional-not.null.validator';
import { IsYYYYMMDD } from '../../../../../common/decorator/validator/is-yyyy-mm-dd.validator';

export class UpdateMinistryGroupDetailHistoryDto {
  @ApiProperty({
    description: '사역 이력 시작 날짜',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('startDate')
  startDate?: string;

  @ApiProperty({
    description: '사역 이력 종료 날짜',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('endDate')
  endDate?: string;
}
