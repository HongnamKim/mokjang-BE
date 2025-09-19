import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { IsDateString, IsOptional } from 'class-validator';
import { IsYYYYMMDD } from '../../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { Transform } from 'class-transformer';

export class GetWorshipSessionCheckStatusDto {
  @ApiProperty({
    description: '교인 그룹',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  groupId?: number;

  @ApiProperty({
    description: '불러올 예배 세션 시작 날짜 (YYYY-MM-DD)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('fromSessionDate')
  from: string;

  @ApiProperty({
    description: '불러올 예배 세션 마지막 날짜 (YYYY-MM-DD)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('toSessionDate')
  to: string;
}
