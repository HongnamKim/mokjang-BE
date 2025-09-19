import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateVisitationDto } from '../request/create-visitation.dto';
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ReportException } from '../../../report/exception/report.exception';

export class AddReceiverDto extends PickType(CreateVisitationDto, [
  'receiverIds',
]) {
  @ApiProperty({
    description: '심방 피보고자 ID',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @ArrayMaxSize(30, { message: ReportException.EXCEED_RECEIVERS })
  override receiverIds: number[];
}
