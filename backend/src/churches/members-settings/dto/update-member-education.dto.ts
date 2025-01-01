import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { EducationStatus } from '../const/education-status.enum';

export class UpdateMemberEducationDto {
  @ApiProperty({
    name: 'isDeleteEducation',
    description: '교인의 교육 이수 삭제 시 true',
    default: false,
    required: true,
  })
  @IsBoolean()
  isDeleteEducation: boolean = false;

  @ApiProperty({
    name: 'educationId',
    description: '교육이수 ID',
    example: 12,
  })
  @IsNumber()
  educationId: number;

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

  @ApiProperty({
    name: 'status',
    description: '교육 상태',
    enum: EducationStatus,
    required: false,
  })
  @IsEnum(EducationStatus)
  @IsOptional()
  status: EducationStatus;
}
