import { BaseOffsetPaginationRequestDto } from '../../../common/dto/request/base-offset-pagination-request.dto';
import { TaskOrder } from '../../const/task-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RemoveSpaces } from '../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../common/decorator/validator/is-title.decorator';
import { TaskStatus } from '../../const/task-status.enum';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';

export class GetTasksDto extends BaseOffsetPaginationRequestDto<TaskOrder> {
  @ApiProperty({
    description: '정렬 조건',
    enum: TaskOrder,
    default: TaskOrder.taskStartDate,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskOrder)
  order: TaskOrder = TaskOrder.taskStartDate;

  @ApiProperty({
    description: '업무 제목',
    required: false,
  })
  @IsOptional()
  @IsString()
  @RemoveSpaces()
  @IsNoSpecialChar()
  title?: string;

  @ApiProperty({
    description: '업무 시작 날짜 ~ 부터',
    required: false,
  })
  @IsOptional()
  @IsDate()
  fromTaskStartDate?: Date;

  @ApiProperty({
    description: '업무 시작 날짜 ~ 까지',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @IsAfterDate('fromTaskStartDate')
  toTaskStartDate?: Date;

  @ApiProperty({
    description: '업무 상태 (예정 / 진행중 / 완료 / 지연)',
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  taskStatus?: TaskStatus;

  @ApiProperty({
    description: '업무 담당자 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  inChargeId?: number;
}
