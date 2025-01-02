import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EducationStatus } from '../../const/education-status.enum';

export class CreateEducationHistoryDto {
  @ApiProperty({
    name: 'educationId',
    description: '교육이수 ID',
    example: 12,
  })
  @IsNumber()
  educationId: number;

  @ApiProperty({
    name: 'status',
    description: '교육 상태',
    enum: EducationStatus,
    required: false,
  })
  @IsEnum(EducationStatus)
  status: EducationStatus;

  @ApiProperty({
    name: 'startDate',
    description: '교육 시작일',
    required: true,
  })
  @IsDate()
  startDate: Date;

  @ApiProperty({
    name: 'endDate',
    description: '교육 종료일',
    required: false,
  })
  @IsDate()
  @IsOptional()
  endDate: Date;
}
