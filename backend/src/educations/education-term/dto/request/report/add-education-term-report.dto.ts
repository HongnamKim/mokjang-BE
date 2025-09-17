import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';
import { ReportException } from '../../../../../report/exception/report.exception';

export class AddEducationTermReportDto {
  @ApiProperty({
    description: '피보고자 ID 배열',
    isArray: true,
  })
  @IsArray()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @ArrayMaxSize(30, { message: ReportException.EXCEED_RECEIVERS })
  receiverIds: number[];
}
