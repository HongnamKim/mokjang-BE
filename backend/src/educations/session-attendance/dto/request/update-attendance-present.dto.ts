import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SessionAttendanceStatus } from '../../const/session-attendance-status.enum';

export class UpdateAttendancePresentDto {
  @ApiProperty({
    description: '출석 여부',
    enum: SessionAttendanceStatus,
  })
  @IsEnum(SessionAttendanceStatus)
  status: SessionAttendanceStatus;
}
