import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
import { IsAfterDate } from '../../../../common/decorator/validator/is-after-date.decorator';

export class GetChurchEventsDto {
  @ApiProperty()
  @IsDate()
  fromDate: Date;

  @ApiProperty()
  @IsDate()
  @IsAfterDate('fromDate')
  toDate: Date;
}
