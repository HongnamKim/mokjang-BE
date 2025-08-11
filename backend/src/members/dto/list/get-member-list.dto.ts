import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SortColumn } from '../../const/enum/list/sort-column.enum';
import { DisplayColumn } from '../../const/enum/list/display-column.enum';
import { Transform } from 'class-transformer';

export class GetMemberListDto {
  @ApiPropertyOptional({ description: '페이지 크기', default: 20 })
  @IsOptional()
  @IsNumber()
  limit: number = 20;

  @ApiPropertyOptional({ description: '커서 (마지막 항목의 ID)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    enum: SortColumn,
    description: '정렬 기준 컬럼',
    default: SortColumn.REGISTERED_AT,
  })
  @IsOptional()
  @IsEnum(SortColumn)
  sortBy: SortColumn = SortColumn.REGISTERED_AT;

  @ApiPropertyOptional({ description: '정렬 방향', default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDirection: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional({
    enum: DisplayColumn,
    isArray: true,
    description: '표시할 컬럼 목록 (사진, 이름은 항상 포함)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @ArrayUnique()
  @IsEnum(DisplayColumn, { each: true })
  displayColumns: DisplayColumn[] = [];
}
