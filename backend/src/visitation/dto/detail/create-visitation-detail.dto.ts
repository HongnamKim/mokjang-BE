import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVisitationDetailDto {
  @ApiProperty({
    description: '심방 대상자 교인 ID',
  })
  @IsNumber()
  memberId: number;

  @ApiProperty({
    description: '심방 내용',
  })
  @IsString()
  @IsOptional()
  visitationContent: string;

  @ApiProperty({
    description: '기도 제목',
  })
  @IsString()
  @IsOptional()
  visitationPray: string;
}
