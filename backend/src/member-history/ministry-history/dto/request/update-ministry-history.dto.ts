import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
import { IsValidHistoryDate } from '../../../decorator/is-valid-history-date.decorator';
import { TransformStartDate } from '../../../decorator/transform-start-date.decorator';
import { TransformEndDate } from '../../../decorator/transform-end-date.decorator';
import { IsAfterDate } from '../../../../common/decorator/validator/is-after-date.decorator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';

export class UpdateMinistryHistoryDto {
  @ApiProperty({
    description: '사역 이력 시작 날짜',
    required: false,
  })
  @IsOptionalNotNull()
  //@IsDateString({ strict: true })
  //@IsYYYYMMDD('startDate')
  @IsDate()
  @IsValidHistoryDate()
  @TransformStartDate()
  startDate: Date;

  @ApiProperty({
    description: '사역 이력 종료 날짜',
    required: false,
  })
  @IsOptionalNotNull()
  //@IsDateString({ strict: true })
  //@IsYYYYMMDD('endDate')
  @IsDate()
  @TransformEndDate()
  @IsValidHistoryDate()
  @IsAfterDate('startDate')
  endDate: Date;
}
