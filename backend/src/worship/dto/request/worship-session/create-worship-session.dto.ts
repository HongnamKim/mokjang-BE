import { ApiProperty, PickType } from '@nestjs/swagger';
import { WorshipSessionModel } from '../../../entity/worship-session.entity';
import { MAX_DESCRIPTION_LENGTH } from '../../../constraints/worship.constraints';
import { IsDate, IsString } from 'class-validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { PlainTextMaxLength } from '../../../../common/decorator/validator/plain-text-max-length.validator';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { Transform } from 'class-transformer';

@SanitizeDto()
export class CreateWorshipSessionDto extends PickType(WorshipSessionModel, [
  //'title',
  'description',
  'sessionDate',
]) {
  /*@ApiProperty({
    description: '예배 세션 제목',
    maxLength: MAX_WORSHIP_TITLE,
  })
  @IsString()
  @IsNotEmpty()
  @IsNoSpecialChar()
  @MaxLength(MAX_WORSHIP_TITLE)
  override title: string;*/

  @ApiProperty({
    description: '예배 세션 설명 (최대 500자(서식 제외), 빈 문자열 허용)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(MAX_DESCRIPTION_LENGTH)
  override description: string;

  @ApiProperty({
    description: '예배 세션 진행 날짜',
  })
  @IsDate()
  @Transform(({ value }) => new Date(value.setHours(0, 0, 0, 0)))
  override sessionDate: Date;
}
