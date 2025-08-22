import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export abstract class BaseCursorPaginationRequestDto<TOrder> {
  @ApiPropertyOptional({ description: '페이지 크기', default: 20 })
  @IsOptional()
  @IsNumber()
  limit: number = 20;

  @ApiPropertyOptional({ description: '커서 (마지막 항목의 ID)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: '정렬 방향', default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDirection: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional({
    description: '정렬 기준',
    enum: [],
    default: undefined,
  })
  @IsOptional()
  @IsEnum(Object)
  abstract sortBy?: TOrder;
}
