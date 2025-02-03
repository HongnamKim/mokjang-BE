import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { IsValidHistoryDate } from '../../decorator/is-valid-history-date.decorator';
import { TransformEndDate } from '../../decorator/transform-end-date.decorator';

export class EndMemberGroupDto {
  @ApiProperty({
    description: '그룹 종료 날짜',
    default: new Date(),
    required: false,
  })
  @IsDate()
  @IsOptional()
  @IsValidHistoryDate()
  @TransformEndDate()
  endDate: Date = new Date();
}
