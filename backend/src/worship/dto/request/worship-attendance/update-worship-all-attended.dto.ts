import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateWorshipAllAttendedDto {
  @ApiPropertyOptional({ description: '그룹 ID', type: 'string' })
  @IsOptional()
  //@IsNumber()
  @Transform(({ value }) => {
    if (value === null) {
      return NaN;
    }

    return +value;
  })
  groupId?: number;
}
