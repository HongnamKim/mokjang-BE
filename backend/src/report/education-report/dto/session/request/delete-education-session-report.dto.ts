import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class DeleteEducationSessionReportDto {
  @ApiProperty({
    description: '업무 피보고자 ID',
    isArray: true,
  })
  @IsArray()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  receiverIds: number[];
}
