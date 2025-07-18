import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';
import { IsValidHistoryDateString } from '../../decorator/is-valid-history-date-string.decorator';
import { IsOptionalNotNull } from '../../../common/decorator/validator/is-optional-not.null.validator';

export class UpdateGroupHistoryDto {
  @ApiProperty({
    description: '그룹 시작 날짜',
    default: new Date(),
    required: false,
  })
  @IsOptionalNotNull()
  @IsDateString({ strict: true })
  @IsValidHistoryDateString('startDate')
  startDate: string;

  @ApiProperty({
    description: '그룹 종료 날짜',
    default: new Date(),
    required: false,
  })
  @IsOptionalNotNull()
  @IsDateString({ strict: true })
  @IsValidHistoryDateString('endDate')
  @IsAfterDate('startDate')
  endDate: string;
}
