import { ApiProperty, PickType } from '@nestjs/swagger';
import { TaskModel } from '../../entity/task.entity';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IsNoSpecialChar } from '../../../common/decorator/validator/is-title.decorator';
import { RemoveSpaces } from '../../../common/decorator/transformer/remove-spaces';
import { SanitizeDto } from '../../../common/decorator/sanitize-target.decorator';
import { TaskStatus } from '../../const/task-status.enum';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';
import { Transform } from 'class-transformer';

@SanitizeDto()
export class CreateTaskDto extends PickType(TaskModel, [
  'parentTaskId',
  'title',
  'taskStatus',
  'taskStartDate',
  'taskEndDate',
  'comment',
  'inChargeId',
]) {
  @ApiProperty({
    description: '상위 업무 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  override parentTaskId: number;

  @ApiProperty({
    description: '업무 제목',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @IsNoSpecialChar()
  @RemoveSpaces()
  @MaxLength(50)
  override title: string;

  @ApiProperty({
    description: '업무 상태 (예약 / 진행중 / 완료 / 지연)',
    enum: TaskStatus,
    default: TaskStatus.RESERVE,
  })
  @IsEnum(TaskStatus)
  override taskStatus: TaskStatus = TaskStatus.RESERVE;

  @ApiProperty({
    description: '업무 시작 일자',
  })
  @IsDate()
  override taskStartDate: Date;

  @ApiProperty({
    description: '업무 종료 일자',
  })
  @IsDate()
  @IsAfterDate('taskStartDate')
  override taskEndDate: Date;

  @ApiProperty({
    description: '업무 내용 코멘트',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment: string;

  @ApiProperty({
    description: '업무 담당자 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  override inChargeId: number;

  @ApiProperty({
    description: '업무 피보고자 ID',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => Array.from(new Set(value)))
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  receiverIds: number[];
}
