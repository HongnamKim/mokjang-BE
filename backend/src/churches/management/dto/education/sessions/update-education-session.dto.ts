import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateEducationSessionDto {
  @ApiProperty({
    description: '교육 완료 상태',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDone: boolean;

  @ApiProperty({
    description: '교육 일시',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  sessionDate: Date = new Date();

  @ApiProperty({
    description: '교육 진행 내용 (최대 300자, 빈 문자열 허용)',
    maxLength: 300,
    required: false,
  })
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) => value?.trim() ?? '')
  @IsOptional()
  content: string;

  /*@ApiProperty({
    description: '교육 진행 내용 삭제 시 true',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  deleteContent: boolean;*/
}
