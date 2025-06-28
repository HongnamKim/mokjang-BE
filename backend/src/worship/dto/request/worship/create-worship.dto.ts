import { ApiProperty, PickType } from '@nestjs/swagger';
import { WorshipModel } from '../../../entity/worship.entity';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { MAX_WORSHIP_TITLE } from '../../../constraints/worship.constraints';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { PlainTextMaxLength } from '../../../../common/decorator/validator/plain-text-max-length.validator';
import { Transform } from 'class-transformer';

@SanitizeDto()
export class CreateWorshipDto extends PickType(WorshipModel, [
  'title',
  'description',
  'worshipDay',
  'repeatPeriod',
]) {
  @ApiProperty({
    description: '예배 제목',
    maxLength: MAX_WORSHIP_TITLE,
  })
  @IsString()
  @IsNotEmpty()
  @IsNoSpecialChar()
  @MaxLength(MAX_WORSHIP_TITLE)
  override title: string;

  @ApiProperty({
    description: '예배 설명 (최대 500자(서식 제외), 빈 문자열 허용)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(500)
  override description: string;

  @ApiProperty({
    description: '예배 진행 요일 (0 ~ 6)',
    minimum: 0,
    maximum: 6,
  })
  @IsNumber()
  @Min(0)
  @Max(6)
  override worshipDay: number;

  @ApiProperty({
    description: '반복 주기',
    minimum: 1,
  })
  @IsNumber()
  @Min(0)
  override repeatPeriod: number;

  @ApiProperty({
    description: '예배 대상 그룹 ID 배열',
  })
  @Transform(({ value }) => Array.from(new Set(value)))
  @IsNumber({}, { each: true })
  @IsArray()
  worshipTargetGroupIds: number[] = [];
}
