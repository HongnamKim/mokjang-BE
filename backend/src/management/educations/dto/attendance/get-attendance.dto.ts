import { AttendanceOrderEnum } from '../../const/order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNumber, IsOptional, Min } from 'class-validator';

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
    description: '정렬 기준 (출석여부, 생성일, 수정일)',
    enum: AttendanceOrderEnum,
    default: AttendanceOrderEnum.educationEnrollmentId,
    required: false,
  })
  @IsOptional()
  @IsEnum(AttendanceOrderEnum)
  order: AttendanceOrderEnum = AttendanceOrderEnum.educationEnrollmentId;

  @ApiProperty({
    description: '정렬 내림차순 / 오름차순',
    default: 'asc',
    required: false,
  })
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC' = 'asc';
}
