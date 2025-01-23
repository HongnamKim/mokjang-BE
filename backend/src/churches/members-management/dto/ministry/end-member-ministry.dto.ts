import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { IsValidHistoryDate } from '../../decorator/is-valid-history-date.decorator';
import { TransformEndDate } from '../../decorator/transform-end-date.decorator';

export class EndMemberMinistryDto {
  @ApiProperty({
    description: '사역 종료 날짜 (입력하지 않을 경우 현재 날짜)',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  @IsValidHistoryDate()
  @TransformEndDate()
  endDate: Date = new Date();
}
