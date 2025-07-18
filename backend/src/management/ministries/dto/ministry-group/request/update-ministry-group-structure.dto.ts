import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateMinistryGroupStructureDto {
  @ApiProperty({
    description: '지정 순서',
    required: true,
  })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiProperty({
    description: '상위 사역 그룹 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parentMinistryGroupId?: number | null;
}
