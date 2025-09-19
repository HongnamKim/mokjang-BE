import { ApiProperty } from '@nestjs/swagger';
import {
  MAX_WORSHIP_SESSION_BIBLE_TITLE_LENGTH,
  MAX_WORSHIP_SESSION_DESCRIPTION_LENGTH,
  MAX_WORSHIP_SESSION_TITLE_LENGTH,
  MAX_WORSHIP_TITLE,
} from '../../../constraints/worship.constraints';
import {
  IsDateString,
  IsNumber,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { PlainTextMaxLength } from '../../../../common/decorator/validator/plain-text-max-length.validator';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../../../common/const/time-zone.const';
import { IsYYYYMMDD } from '../../../../common/decorator/validator/is-yyyy-mm-dd.validator';

@SanitizeDto()
export class CreateWorshipSessionDto {
  @ApiProperty({
    description: '예배 세션 진행 날짜 (필수, YYYY-MM-DD)',
  })
  @IsYYYYMMDD('sessionDate')
  @IsDateString({ strict: true })
  sessionDate: string;

  get sessionDateUtc(): Date {
    return fromZonedTime(`${this.sessionDate}T00:00:00`, TIME_ZONE.SEOUL);
  }

  @ApiProperty({
    description: '예배 세션 제목',
    maxLength: MAX_WORSHIP_TITLE,
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNoSpecialChar()
  @MaxLength(MAX_WORSHIP_SESSION_TITLE_LENGTH)
  title: string;

  @ApiProperty({
    description: '성경 본문',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(MAX_WORSHIP_SESSION_BIBLE_TITLE_LENGTH)
  bibleTitle: string;

  @ApiProperty({
    description: '예배 세션 설명 (최대 1000자(서식 제외), 빈 문자열 허용)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(MAX_WORSHIP_SESSION_DESCRIPTION_LENGTH)
  description: string;

  @ApiProperty({
    description: '예배 세션 영상 URL',
    required: false,
  })
  @IsOptionalNotNull()
  @IsUrl()
  videoUrl: string;

  @ApiProperty({
    description: '설교자 교인 ID',
    required: false,
  })
  @IsOptionalNotNull()
  @IsNumber()
  @Min(1)
  inChargeId: number;
}
