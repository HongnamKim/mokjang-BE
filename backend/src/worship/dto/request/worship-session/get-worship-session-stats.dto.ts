import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetWorshipSessionStatsDto {
  @ApiPropertyOptional({ description: '조회할 그룹', type: 'string' })
  @IsOptional()
  @Transform(({ value }) => +value)
  groupId?: number;
}
