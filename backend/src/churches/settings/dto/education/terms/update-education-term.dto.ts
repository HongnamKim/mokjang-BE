import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, Min, ValidateIf } from 'class-validator';
import { IsLessOrEqualThan } from '../../../decorator/is-less-or-equal-than.decorator';
import { IsAfterDate } from '../../../decorator/is-valid-end-date.decorator';

export class UpdateEducationTermDto {
  @ApiProperty({
    description: '총 몇 회의 교육으로 이루어졌는지 (최소값: 1)',
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  numberOfSessions: number;

  @ApiProperty({
    description: '수료 기준 출석 횟수 (선택값)',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @ValidateIf((o) => o.numberOfSessions !== undefined)
  @IsLessOrEqualThan('numberOfSessions')
  completionCriteria: number;

  @ApiProperty({
    description: '교육회차 시작일',
  })
  @IsDate()
  @IsOptional()
  startDate: Date;

  @ApiProperty({
    description: '교육회차 종료일',
  })
  @IsOptional()
  @IsDate()
  @ValidateIf((o) => o.startDate !== undefined)
  @IsAfterDate('startDate')
  endDate: Date;

  @ApiProperty({
    description: '교육 진행자 ID',
    minimum: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  instructorId: number;
}
