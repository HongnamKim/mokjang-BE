import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import { EducationEnrollmentStatus } from '../../../management/educations/const/education-status.enum';

export class GetEducationHistoryDto {
  @ApiProperty({
    description: '조회할 데이터 개수',
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take: number = 20;

  @ApiProperty({
    description: '조회할 페이지',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: '정렬 오름차순 / 내림차순',
    default: 'desc',
    required: false,
  })
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @IsOptional()
  orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC' = 'desc';

  @ApiProperty({
    description: '교육 상태',
    enum: EducationEnrollmentStatus,
    required: false,
  })
  @IsEnum(EducationEnrollmentStatus)
  @IsOptional()
  status: EducationEnrollmentStatus;
}
