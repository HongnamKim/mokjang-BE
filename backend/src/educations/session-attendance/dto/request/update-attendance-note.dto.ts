import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsBasicText } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';

@SanitizeDto()
export class UpdateAttendanceNoteDto {
  @ApiProperty({
    description: '비고 (최대 50자, 빈 문자열 허용)',
    maxLength: 120,
    required: false,
  })
  @IsString()
  @Transform(({ value }) => value?.trim() ?? '')
  @IsBasicText('note')
  @MaxLength(50)
  note: string;
}
