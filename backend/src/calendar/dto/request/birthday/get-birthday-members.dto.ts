import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
import { IsAfterDate } from '../../../../common/decorator/validator/is-after-date.decorator';

export class GetBirthdayMembersDto {
  @ApiProperty({
    description: '검색 시작 날짜',
    default: new Date(new Date().setDate(1)).toISOString().slice(0, 10),
  })
  @IsDate()
  fromDate: Date;

  @ApiProperty({
    description: '검색 종료 날짜',
    default: new Date(new Date().setDate(31)).toISOString().slice(0, 10),
  })
  @IsDate()
  @IsAfterDate('fromDate')
  toDate: Date;
}
