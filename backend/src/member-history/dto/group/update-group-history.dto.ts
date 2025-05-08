import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { IsValidHistoryDate } from '../../decorator/is-valid-history-date.decorator';
import { TransformEndDate } from '../../decorator/transform-end-date.decorator';
import { TransformStartDate } from '../../decorator/transform-start-date.decorator';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';

export class UpdateGroupHistoryDto {
  @ApiProperty({
    description: '그룹 시작 날짜',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  @IsValidHistoryDate()
  @TransformStartDate()
  startDate: Date;

  @ApiProperty({
    description: '그룹 종료 날짜',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  @TransformEndDate()
  @IsValidHistoryDate()
  @IsAfterDate('startDate')
  endDate: Date;
}
