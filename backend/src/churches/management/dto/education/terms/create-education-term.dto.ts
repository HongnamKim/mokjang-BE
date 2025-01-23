import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationTermModel } from '../../../entity/education/education-term.entity';
import { IsDate, IsNumber, IsOptional, Min, ValidateIf } from 'class-validator';
import { IsAfterDate } from '../../../decorator/is-after-date.decorator';
import { IsLessOrEqualThan } from '../../../decorator/is-less-or-equal-than.decorator';

export class CreateEducationTermDto extends PickType(EducationTermModel, [
  'term',
  'numberOfSessions',
  'completionCriteria',
  'startDate',
  'endDate',
  'instructorId',
]) {
  @ApiProperty({
    description: '기수',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  term: number;

  @ApiProperty({
    description: '총 몇 회의 교육으로 이루어졌는지 (최소값: 1)',
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  override numberOfSessions: number = 1;

  @ApiProperty({
    description: '수료 기준 출석 횟수 (선택값)',
    minimum: 1,
    required: false,
  })
  @ValidateIf((o) => o.numberOfSessions !== undefined)
  @IsNumber()
  @Min(1)
  @IsLessOrEqualThan('numberOfSessions')
  @IsOptional()
  override completionCriteria: number;

  @ApiProperty({
    description: '교육회차 시작일',
  })
  @IsDate()
  override startDate: Date;

  @ApiProperty({
    description: '교육회차 종료일',
  })
  @IsDate()
  @ValidateIf((o) => o.startDate !== undefined)
  @IsAfterDate('startDate')
  override endDate: Date;

  @ApiProperty({
    description: '교육 진행자 ID',
    minimum: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  override instructorId: number;
}
