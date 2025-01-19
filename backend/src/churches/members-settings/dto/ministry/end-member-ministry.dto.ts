import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';

export class EndMemberMinistryDto {
  @ApiProperty({
    description: '사역 종료 날짜 (입력하지 않을 경우 현재 날짜)',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  endDate: Date = new Date();
}
