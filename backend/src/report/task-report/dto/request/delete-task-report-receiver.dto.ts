import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, Min } from 'class-validator';

export class DeleteTaskReportReceiverDto {
  @ApiProperty({
    description: '업무 피보고자 ID',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  receiverIds: number[];
}
