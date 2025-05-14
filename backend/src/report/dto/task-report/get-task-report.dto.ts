import { BaseOffsetPaginationRequestDto } from '../../../common/dto/request/base-offset-pagination-request.dto';
import { TaskReportOrderEnum } from '../../const/task-report-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { QueryBoolean } from '../../../common/decorator/transformer/query-boolean.decorator';

export class GetTaskReportDto extends BaseOffsetPaginationRequestDto<TaskReportOrderEnum> {
  @ApiProperty({
    description: '정렬 기준',
    enum: TaskReportOrderEnum,
    default: TaskReportOrderEnum.createdAt,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskReportOrderEnum)
  order: TaskReportOrderEnum = TaskReportOrderEnum.createdAt;

  @ApiProperty({
    description: '읽은 보고 or 읽지 않은 보고',
    required: false,
  })
  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({
    description: '확인 처리한 보고 or 하지 않은 보고',
    required: false,
  })
  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  isConfirmed?: boolean;
}
