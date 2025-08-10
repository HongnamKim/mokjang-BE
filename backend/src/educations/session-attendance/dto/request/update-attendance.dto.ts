import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { IsBasicText } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { SessionAttendanceStatus } from '../../const/session-attendance-status.enum';

@SanitizeDto()
export class UpdateAttendanceDto {
  @ApiProperty({
    description: '출석 여부',
    required: false,
    enum: SessionAttendanceStatus,
  })
  @IsEnum(SessionAttendanceStatus)
  @IsOptional()
  attendanceStatus: SessionAttendanceStatus;

  @ApiProperty({
    description: '비고 (최대 120자, 빈 문자열 허용)',
    maxLength: 120,
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @Transform(({ value }) => value?.trim() ?? '')
  @IsBasicText('note')
  @MaxLength(50)
  note: string;
}
