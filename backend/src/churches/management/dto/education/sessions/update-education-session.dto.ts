import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEducationSessionDto {
  @ApiProperty({
    description: '교육 진행 내용',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content: string;

  @ApiProperty({
    description: '교육 진행 내용 삭제 시 true',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  deleteContent: boolean;
}
