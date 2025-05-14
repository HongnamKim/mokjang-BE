import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddTaskReportReceiverDto {
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
