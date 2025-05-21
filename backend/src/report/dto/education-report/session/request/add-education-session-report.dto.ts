import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddEducationSessionReportDto {
  @ApiProperty({
    description: '피보고자 ID 배열',
    isArray: true,
  })
  @Transform(({ value }) => {
    return Array.isArray(value) ? Array.from(new Set(value)) : value;
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  receiverIds: number[];
}
