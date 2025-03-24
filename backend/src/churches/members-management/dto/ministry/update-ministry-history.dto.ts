import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { IsValidHistoryDate } from '../../decorator/is-valid-history-date.decorator';
import { TransformStartDate } from '../../decorator/transform-start-date.decorator';
import { TransformEndDate } from '../../decorator/transform-end-date.decorator';
import { IsAfterDate } from '../../../../management/decorator/is-after-date.decorator';

export class UpdateMinistryHistoryDto {
  @ApiProperty({
    description: '사역 이력 시작 날짜',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @IsValidHistoryDate()
  @TransformStartDate()
  startDate: Date;

  @ApiProperty({
    description: '사역 이력 종료 날짜',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @TransformEndDate()
  @IsValidHistoryDate()
  @IsAfterDate('startDate')
  endDate: Date;
}
