import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVisitationDetailDto {
  @ApiProperty({
    description: '심방 내용',
    required: false,
  })
  @IsString()
  @IsOptional()
  visitationContent?: string;

  @ApiProperty({
    description: '기도 제목',
    required: false,
  })
  @IsString()
  @IsOptional()
  visitationPray?: string;
}
