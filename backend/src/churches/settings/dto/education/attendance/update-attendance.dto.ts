import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceDto {
  @ApiProperty({
    description: '출석 여부',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPresent: boolean;

  @ApiProperty({
    description: '비고',
    maxLength: 120,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  note: string;

  @ApiProperty({
    description: '비고 삭제 시 true',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleteNote: boolean = false;
}
