import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNumber, IsOptional } from 'class-validator';

export abstract class BaseOffsetPaginationRequestDto<TOrder> {
  @ApiProperty({
    name: 'take',
    description: '조회할 데이터 개수',
    default: 20,
    example: 20,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  take: number = 20;

  @ApiProperty({
    name: 'page',
    description: '조회할 페이지',
    default: 1,
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    description: '정렬 기준',
    enum: [],
    default: undefined,
  })
  @IsOptional()
  @IsEnum(Object)
  abstract order?: TOrder;

  @ApiProperty({
    name: 'orderDirection',
    description: '정렬 오름차순 / 내림차순',
    default: 'ASC',
    required: false,
  })
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  orderDirection: 'ASC' | 'DESC';
}
