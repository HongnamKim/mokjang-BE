import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ReportException } from '../../../exception/report.exception';

export class AddTaskReportReceiverDto {
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
