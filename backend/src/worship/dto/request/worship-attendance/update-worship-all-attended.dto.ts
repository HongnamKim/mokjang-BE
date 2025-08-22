import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateWorshipAllAttendedDto {
  @ApiPropertyOptional({ description: '그룹 ID' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  groupId?: number;
}
