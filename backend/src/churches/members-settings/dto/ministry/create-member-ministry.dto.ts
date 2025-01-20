import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateMemberMinistryDto {
  @ApiProperty({
    description: '교인에게 부여할 사역의 ID',
  })
  @IsNumber()
  @Min(1)
  ministryId: number;

  @ApiProperty({
    description: '사역 시작일',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  startDate: Date = new Date();
}
