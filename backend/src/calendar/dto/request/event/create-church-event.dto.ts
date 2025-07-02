import { IsDate, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { PlainTextMaxLength } from '../../../../common/decorator/validator/plain-text-max-length.validator';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  MAX_CHURCH_EVENT_DESCRIPTION,
  MAX_CHURCH_EVENT_TITLE,
} from '../../../const/church-event.constraints';

@SanitizeDto()
export class CreateChurchEventDto {
  @ApiProperty({
    description: '이벤트 제목',
  })
  @IsString()
  @IsNoSpecialChar()
  @IsNotEmpty()
  @MaxLength(MAX_CHURCH_EVENT_TITLE)
  title: string;

  @ApiProperty({
    description: '교회 이벤트 날짜',
  })
  @IsDate()
  date: Date;

  @ApiProperty({
    description: '교회 이벤트 상세내용',
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(MAX_CHURCH_EVENT_DESCRIPTION)
  description?: string;
}
