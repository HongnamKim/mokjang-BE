import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { EducationStatus } from '../../const/education/education-status.enum';

export class GetEducationHistoryDto {
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
    enum: EducationStatus,
    required: false,
  })
  @IsEnum(EducationStatus)
  @IsOptional()
  status: EducationStatus;
}
