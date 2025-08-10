import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsNumber, Min } from 'class-validator';

export class AddEducationTermReportDto {
  @ApiProperty({
    description: '피보고자 ID 배열',
    isArray: true,
  })
  @IsArray()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  receiverIds: number[];
}
