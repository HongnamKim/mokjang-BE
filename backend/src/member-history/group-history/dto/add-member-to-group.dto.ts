import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, Min } from 'class-validator';
import { IsYYYYMMDD } from '../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { IsValidHistoryDateString } from '../../decorator/is-valid-history-date-string.decorator';

export class AddMemberToGroupDto {
  @ApiProperty({
    description: '그룹 ID',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  groupId: number;

  @ApiProperty({
    description: '그룹 시작일',
    default: 'YYYY-MM-DD',
  })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('startDate')
  @IsValidHistoryDateString('startDate')
  startDate: string;
}
