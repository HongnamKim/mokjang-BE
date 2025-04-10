import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class VisitationDetailDto {
  @ApiProperty({
    description: '심방 대상자 ID',
  })
  @IsNumber()
  @Min(1)
  memberId: number;

  @ApiProperty({
    description: '심방 내용 (예약 시 생략)',
  })
  @IsString()
  @IsOptional()
  visitationContent?: string;

  @ApiProperty({
    description: '기도 제목 (예약 시 생략)',
  })
  @IsString()
  @IsOptional()
  visitationPray?: string;
}
