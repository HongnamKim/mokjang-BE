import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import { AttendanceOrder } from '../../const/attendance-order.enum';
import { SessionAttendanceStatus } from '../../const/session-attendance-status.enum';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';

export class GetAttendanceDto {
  @ApiProperty({
    description: '요청 데이터 개수',
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take: number = 20;

  @ApiProperty({
    description: '요청 페이지',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: '정렬 기준 (생성일, 수정일, 교인 이름, 출석여부)',
    enum: AttendanceOrder,
    default: AttendanceOrder.CREATED_AT,
    required: false,
  })
  @IsOptional()
  @IsEnum(AttendanceOrder)
  order: AttendanceOrder = AttendanceOrder.CREATED_AT;

  @ApiProperty({
    description: '정렬 내림차순 / 오름차순',
    default: 'ASC',
    required: false,
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDirection: 'ASC' | 'DESC' = 'ASC';

  @ApiProperty({
    description: '출석 status',
    enum: SessionAttendanceStatus,
    required: false,
  })
  @IsOptionalNotNull()
  @IsEnum(SessionAttendanceStatus)
  status?: SessionAttendanceStatus;
}
