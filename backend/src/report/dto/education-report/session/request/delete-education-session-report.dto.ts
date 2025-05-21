import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class DeleteEducationSessionReportDto {
  @ApiProperty({
    description: '업무 피보고자 ID',
    isArray: true,
  })
  @Transform(({ value }) =>
    Array.isArray(value) ? Array.from(new Set(value)) : value,
  )
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  receiverIds: number[];
}
