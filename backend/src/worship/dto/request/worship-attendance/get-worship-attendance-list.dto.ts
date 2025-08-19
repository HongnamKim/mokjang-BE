import { BaseCursorPaginationRequestDto } from '../../../../common/dto/request/base-cursor-pagination-request.dto';
import { WorshipAttendanceSortColumn } from '../../../const/worship-attendance-sort-column.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class GetWorshipAttendanceListDto extends BaseCursorPaginationRequestDto<WorshipAttendanceSortColumn> {
  @ApiPropertyOptional({
    enum: WorshipAttendanceSortColumn,
    description: '정렬 기준 컬럼',
    default: WorshipAttendanceSortColumn.NAME,
  })
  @IsOptional()
  @IsEnum(WorshipAttendanceSortColumn)
  sortBy: WorshipAttendanceSortColumn = WorshipAttendanceSortColumn.NAME;

  @ApiPropertyOptional({
    description: '조회할 그룹 ID',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  groupId?: number;
}
