import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

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
}
