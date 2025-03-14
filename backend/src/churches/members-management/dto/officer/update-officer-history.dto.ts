import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, ValidateIf } from 'class-validator';
import { IsValidHistoryDate } from '../../decorator/is-valid-history-date.decorator';
import { TransformStartDate } from '../../decorator/transform-start-date.decorator';
import { TransformEndDate } from '../../decorator/transform-end-date.decorator';
import { IsAfterDate } from '../../../../management/decorator/is-after-date.decorator';

export class UpdateOfficerHistoryDto {
  @ApiProperty({
    description: '직분 시작 날짜',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  @IsValidHistoryDate()
  @TransformStartDate()
  startDate: Date;

  @ApiProperty({
    description: '직분 종료 날짜',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  @IsValidHistoryDate()
  @TransformEndDate()
  @ValidateIf((o) => o.startDate)
  @IsAfterDate('startDate')
  endDate: Date;
}
