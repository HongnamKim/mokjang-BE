import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class GetWorshipSessionStatsDto {
  @ApiPropertyOptional({ description: '조회할 그룹' })
  @IsOptional()
  @IsNumber()
  groupId?: number;
}
