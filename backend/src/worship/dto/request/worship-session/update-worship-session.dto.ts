import { ApiProperty } from '@nestjs/swagger';
import { MAX_WORSHIP_TITLE } from '../../../constraints/worship.constraints';
import { IsDate, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { PlainTextMaxLength } from '../../../../common/decorator/validator/plain-text-max-length.validator';
import { Transform } from 'class-transformer';

export class UpdateWorshipSessionDto {
  @ApiProperty({
    description: '예배 세션 제목',
    maxLength: MAX_WORSHIP_TITLE,
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  @IsNoSpecialChar()
  @MaxLength(MAX_WORSHIP_TITLE)
  title: string;

  @ApiProperty({
    description: '예배 세션 설명 (최대 500자(서식 제외), 빈 문자열 허용)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(500)
  description: string;

  @ApiProperty({
    description: '예배 세션 진행 날짜',
  })
  @IsOptionalNotNull()
  @IsDate()
  @Transform(({ value }) => new Date(value.setHours(0, 0, 0, 0)))
  sessionDate: Date;
}
