import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class GetMinistryHistoryDto {
  @ApiProperty({
    description: '정렬 오름차순 / 내림차순',
    required: false,
  })
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC' = 'desc';
}
