import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class GetMinistryDto {
  @ApiProperty({
    description: '사역 그룹 ID (0 일 경우 사역 그룹에 속하지 않은 사역 조회)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  ministryGroupId: number;

  @ApiProperty({
    description: '정렬 기준',
    required: false,
  })
  @IsIn(['name', 'createdAt', 'updatedAt', 'ministryGroupId'])
  @IsOptional()
  order: string = 'createdAt';

  @ApiProperty({
    description: '정렬 오름차순 / 내림차순',
    required: false,
  })
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @IsOptional()
  orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC' = 'asc';
}
