import { ApiProperty } from '@nestjs/swagger';
import { MAX_WORSHIP_TITLE } from '../../../constraints/worship.constraints';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { PlainTextMaxLength } from '../../../../common/decorator/validator/plain-text-max-length.validator';
import { Transform } from 'class-transformer';

export class UpdateWorshipDto {
  @ApiProperty({
    description: '예배 제목',
    maxLength: MAX_WORSHIP_TITLE,
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  @IsNoSpecialChar()
  @MaxLength(MAX_WORSHIP_TITLE)
  title: string;

  @ApiProperty({
    description: '예배 설명 (최대 500자(서식 제외), 빈 문자열 허용)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(500)
  description: string;

  @ApiProperty({
    description: '예배 진행 요일 (0 ~ 6)',
    minimum: 0,
    maximum: 6,
    required: false,
  })
  @IsOptionalNotNull()
  @IsNumber()
  @Min(0)
  @Max(6)
  worshipDay: number;

  @ApiProperty({
    description: '반복 주기',
    minimum: 1,
    required: false,
  })
  @IsOptionalNotNull()
  @IsNumber()
  @Min(0)
  repeatPeriod: number;

  @ApiProperty({
    description: '예배 대상 그룹 ID 배열',
    required: false,
  })
  @IsOptionalNotNull()
  @Transform(({ value }) => Array.from(new Set(value)))
  @IsNumber({}, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  worshipTargetGroupIds: number[];
}
