import { IsDate } from 'class-validator';
import { IsAfterDate } from '../../../../common/decorator/validator/is-after-date.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class GetEducationSessionForCalendarDto {
  @ApiProperty({})
  @IsDate()
  fromDate: Date;

  @ApiProperty({})
  @IsDate()
  @IsAfterDate('fromDate')
  toDate: Date;
}
