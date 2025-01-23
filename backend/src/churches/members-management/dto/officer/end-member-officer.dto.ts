import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { IsValidHistoryDate } from '../../decorator/is-valid-history-date.decorator';
import { TransformEndDate } from '../../decorator/transform-end-date.decorator';

export class EndMemberOfficeDto {
  @ApiProperty({
    description: '직분 종료 날짜 (기본값: 현재 날짜)',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  @IsValidHistoryDate()
  @TransformEndDate()
  endDate: Date = new Date();
}
