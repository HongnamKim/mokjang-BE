import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { AttendanceRange } from '../../const/attendance-range.enum';
import { LowAttendanceOrder } from '../../const/low-attendance-order.enum';
import { BaseOffsetPaginationRequestDto } from '../../../common/dto/request/base-offset-pagination-request.dto';

export class GetLowWorshipAttendanceMembersDto extends BaseOffsetPaginationRequestDto<LowAttendanceOrder> {
  @ApiProperty({
    description: '정렬 조건',
    enum: LowAttendanceOrder,
    default: LowAttendanceOrder.ATTENDANCE_RATE,
  })
  @IsOptional()
  @IsEnum(LowAttendanceOrder)
  order: LowAttendanceOrder = LowAttendanceOrder.ATTENDANCE_RATE;

  @ApiProperty({
    description: '조회할 데이터 개수',
    required: false,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  override take: number = 20;

  @ApiProperty({
    description: '예배 ID',
  })
  @IsNumber()
  @Min(1)
  worshipId: number;

  @ApiProperty({
    description: '검색 단위 (월간 / 분기 / 반기)',
    enum: AttendanceRange,
    default: AttendanceRange.MONTHLY,
    required: false,
  })
  @IsOptional()
  @IsEnum(AttendanceRange)
  range: AttendanceRange = AttendanceRange.MONTHLY;

  @ApiProperty({
    description: '저조 출석률 기준 (0 ~ 1)',
    default: 0.5,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold: number = 0.5;
}
