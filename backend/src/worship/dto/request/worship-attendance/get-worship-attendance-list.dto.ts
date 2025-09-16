import { BaseCursorPaginationRequestDto } from '../../../../common/dto/request/base-cursor-pagination-request.dto';
import { WorshipAttendanceSortColumn } from '../../../const/worship-attendance-sort-column.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

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
    type: 'string',
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  groupId?: number;
}
