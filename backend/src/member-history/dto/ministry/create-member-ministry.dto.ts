import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, Min } from 'class-validator';
import { IsValidHistoryDate } from '../../decorator/is-valid-history-date.decorator';
import { TransformStartDate } from '../../decorator/transform-start-date.decorator';

export class CreateMemberMinistryDto {
  @ApiProperty({
    description: '사역 그룹 Id',
  })
  @IsNumber()
  @Min(1)
  ministryGroupId: number;

  @ApiProperty({
    description: '교인에게 부여할 사역의 ID',
  })
  @IsNumber()
  @Min(1)
  ministryId: number;

  @ApiProperty({
    description: '사역 시작일',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  @IsValidHistoryDate()
  @TransformStartDate()
  startDate: Date = new Date();
}
