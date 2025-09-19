import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateOfficerStructureDto {
  @ApiProperty({
    description: '디스플레이 순서',
    required: true,
  })
  @IsNumber()
  @Min(1)
  order: number;
}
