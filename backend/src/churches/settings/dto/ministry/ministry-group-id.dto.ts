import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class MinistryGroupIdDto {
  @ApiProperty({
    description: '사역 그룹 ID (그룹 지정되지 않은 사역일 경우 생략)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  ministryGroupId: number;
}
