import { AttendanceStatus } from '../../../const/attendance-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { IsEnum, IsString, MaxLength } from 'class-validator';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { MAX_NOTE_LENGTH } from '../../../constraints/worship.constraints';

@SanitizeDto()
export class UpdateWorshipAttendanceDto {
  @ApiProperty({
    description: '출석 정보',
    enum: AttendanceStatus,
    required: false,
  })
  @IsOptionalNotNull()
  @IsEnum(AttendanceStatus)
  attendanceStatus: AttendanceStatus;

  @ApiProperty({
    description: '출석 비고',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @MaxLength(MAX_NOTE_LENGTH)
  note: string;
}
