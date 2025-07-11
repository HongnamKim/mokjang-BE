import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateGroupStructureDto {
  @ApiProperty({
    description: '상위 그룹 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  parentGroupId?: number | null;

  @ApiProperty({
    description: '그룹의 디스플레이 순서',
    required: true,
  })
  @IsNumber()
  @Min(1)
  order: number;
}
