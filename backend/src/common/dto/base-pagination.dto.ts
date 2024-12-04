import { IsIn, IsNumber, IsOptional, IsString, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BasePaginationDto {
  @IsNumber({}, { message: 'page' })
  @IsOptional()
  //@Type(() => Number) enableImplicitConversion 옵션으로 대체
  @ApiProperty({
    name: 'page',
    description: '페이지 기반 pagination 시 사용, 값이 없을 경우 cursor 기반',
    example: 1,
    required: false,
    default: 1,
  })
  page: number = 1;

  @IsNumber({}, { message: 'less_than' })
  @IsOptional()
  @ApiProperty({
    name: 'where__id__less_than',
    description: '요청 대상의 최대 id 값 (내림차순일 때만 적용)',
    example: 40,
    required: false,
    default: Number.MAX_SAFE_INTEGER,
  })
  where__id__less_than?: number = Number.MAX_SAFE_INTEGER;

  @IsNumber({}, { message: 'more_than' })
  @IsOptional()
  @ApiProperty({
    name: 'where__id__more_than',
    description: '요청 대상의 최소 id 값 (오름차순일 때만 적용)',
    example: 40,
    required: false,
    default: 0,
  })
  where__id__more_than?: number = 0;

  // 정렬 옵선
  // createdAt -> 생성된 시간의 내림/오름차순으로 정렬
  @IsIn(['ASC', 'asc', 'DESC', 'desc'], { message: 'order' }) // 배열 안의 값만 허용
  @IsOptional()
  @ApiProperty({
    name: 'order__createdAt',
    description: '정렬 순서 (생성일 기준)',
    example: 'asc',
    required: false,
    default: 'ASC',
  })
  order__createdAt?: 'ASC' | 'asc' | 'DESC' | 'desc' = 'ASC';

  // 데이터 개수
  @IsNumber({}, { message: 'take' })
  @Max(100)
  @IsOptional()
  @ApiProperty({
    name: 'take',
    description: '요청 개수',
    example: 50,
    required: false,
    default: 20,
    maximum: 100,
  })
  //@Type(() => Number)
  take: number = 20;
}
