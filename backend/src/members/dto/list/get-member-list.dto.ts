import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { MemberSortColumn } from '../../const/enum/list/sort-column.enum';
import { MemberDisplayColumn } from '../../const/enum/list/display-column.enum';
import { Transform } from 'class-transformer';
import { MarriageStatusFilter } from '../../const/enum/list/marriage-status-filter.enum';
import { BaptismStatusFilter } from '../../const/enum/list/baptism-status-filter.enum';
import { IsYYYYMMDD } from '../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';

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
    enum: MemberSortColumn,
    description: '정렬 기준 컬럼',
    default: MemberSortColumn.REGISTERED_AT,
  })
  @IsOptional()
  @IsEnum(MemberSortColumn)
  sortBy: MemberSortColumn = MemberSortColumn.REGISTERED_AT;

  @ApiPropertyOptional({ description: '정렬 방향', default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDirection: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional({
    enum: MemberDisplayColumn,
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
  @IsEnum(MemberDisplayColumn, { each: true })
  displayColumns: MemberDisplayColumn[] = [];

  @ApiPropertyOptional({
    description: '그룹 ID 목록 ("null" 포함 시 그룹 없는 교인 조회)',
    type: [String],
    example: ['1', '2', 'null'],
  })
  @Transform(({ value }) => {
    if (!value) return undefined;
    const arr = Array.isArray(value) ? value : [value];
    return arr.map((v) => (v === 'null' ? 'null' : Number(v)));
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  groupIds?: (number | 'null')[];

  @ApiPropertyOptional({
    description: '직분 ID 목록 ("null" 포함 시 직분 없는 교인 조회)',
    type: [String],
    example: ['1', '2', 'null'],
  })
  @Transform(({ value }) => {
    if (!value) return undefined;
    const arr = Array.isArray(value) ? value : [value];
    return arr.map((v) => (v === 'null' ? 'null' : Number(v)));
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  officerIds?: (number | 'null')[];

  // 결혼 상태 필터 (복수 선택)
  @ApiPropertyOptional({
    enum: MarriageStatusFilter,
    isArray: true,
    description: '결혼 상태 (null: 값 없음)',
  })
  @Transform(({ value }) => {
    if (!value) return undefined;
    return Array.isArray(value) ? value : [value];
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(MarriageStatusFilter, { each: true })
  marriageStatuses?: MarriageStatusFilter[];

  // 신급 필터 (복수 선택)
  @ApiPropertyOptional({
    enum: BaptismStatusFilter,
    isArray: true,
    description: '신급 상태',
  })
  @Transform(({ value }) => {
    if (!value) return undefined;
    return Array.isArray(value) ? value : [value];
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(BaptismStatusFilter, { each: true })
  baptismStatuses?: BaptismStatusFilter[];

  // 생년월일 범위 필터
  @ApiPropertyOptional({
    description: '생년월일 시작 (yyyy-MM-dd)',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('birthFrom')
  birthFrom?: string;

  @ApiPropertyOptional({
    description: '생년월일 끝 (yyyy-MM-dd)',
    example: '2000-12-31',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('birthTo')
  @IsAfterDate('birthFrom')
  birthTo?: string;

  // 등록일 범위 필터
  @ApiPropertyOptional({
    description: '등록일 시작 (yyyy-MM-dd)',
    example: '2020-01-01',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('registeredFrom')
  registeredFrom?: string;

  @ApiPropertyOptional({
    description: '등록일 끝 (yyyy-MM-dd)',
    example: '2023-12-31',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('registeredTo')
  @IsAfterDate('registeredFrom')
  registeredTo?: string;

  @ApiPropertyOptional({ description: '검색어 (최소 2글자)' })
  @IsOptional()
  @Transform(({ value }) => (value ? value.trim() : value))
  @MinLength(2, { message: '검색어는 최소 2글자 이상이어야 합니다.' })
  search?: string;
}
