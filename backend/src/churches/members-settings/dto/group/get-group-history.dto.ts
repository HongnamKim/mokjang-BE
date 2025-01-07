import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class GetGroupHistoryDto {
  @ApiProperty({
    description: '정렬 오름차순 / 내림차순',
    default: 'desc',
    required: false,
  })
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @IsOptional()
  orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC' = 'desc';
}
