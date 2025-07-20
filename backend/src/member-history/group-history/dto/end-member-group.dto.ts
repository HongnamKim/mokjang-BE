import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { IsYYYYMMDD } from '../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { IsValidHistoryDateString } from '../../decorator/is-valid-history-date-string.decorator';

export class EndMemberGroupDto {
  @ApiProperty({
    description: '그룹 종료 날짜',
    default: 'YYYY-MM-DD',
  })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('endDate')
  @IsValidHistoryDateString('endDate')
  endDate: string;
}
