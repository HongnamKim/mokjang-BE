import { ApiProperty, PickType } from '@nestjs/swagger';
import { TaskModel } from '../../entity/task.entity';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IsNoSpecialChar } from '../../../common/decorator/validator/is-no-special-char.validator';
import { RemoveSpaces } from '../../../common/decorator/transformer/remove-spaces';
import { SanitizeDto } from '../../../common/decorator/sanitize-target.decorator';
import { TaskStatus } from '../../const/task-status.enum';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';
import { IsDateTime } from '../../../common/decorator/validator/is-date-time.validator';
import { ReportException } from '../../../report/exception/report.exception';

@SanitizeDto()
export class CreateTaskDto extends PickType(TaskModel, [
  'parentTaskId',
  'title',
  'status',
  'content',
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
  })
  @IsEnum(TaskStatus)
  override status: TaskStatus;

  @ApiProperty({
    description: '업무 시작 일자 (yyyy-MM-ddTHH:MM:SS)',
  })
  @IsDateString({ strict: true })
  @IsDateTime('startDate')
  startDate: string;

  utcStartDate: Date;

  @ApiProperty({
    description: '업무 종료 일자 (yyyy-MM-ddTHH:MM:SS)',
  })
  @IsDateString({ strict: true })
  @IsDateTime('endDate')
  @IsAfterDate('startDate')
  endDate: string;

  utcEndDate: Date;

  @ApiProperty({
    description: '업무 내용',
    required: false,
  })
  @IsOptional()
  @IsString()
  override content: string;

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
  //@Transform(({ value }) => Array.from(new Set(value)))
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @ArrayMaxSize(30, { message: ReportException.EXCEED_RECEIVERS })
  receiverIds: number[];
}
