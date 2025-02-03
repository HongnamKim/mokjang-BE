import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAttendanceDto {
  @ApiProperty({
    description: '출석 여부',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPresent: boolean;

  @ApiProperty({
    description: '비고 (최대 120자, 빈 문자열 허용)',
    maxLength: 120,
    required: false,
  })
  @IsString()
  @Transform(({ value }) => value?.trim() ?? '')
  @IsOptional()
  @MaxLength(120)
  note: string;
}
