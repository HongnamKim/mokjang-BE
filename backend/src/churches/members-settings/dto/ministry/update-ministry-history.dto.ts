import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, ValidateIf } from 'class-validator';
import { IsAfterDate } from '../../../settings/decorator/is-valid-end-date.decorator';

export class UpdateMinistryHistoryDto {
  @ApiProperty({
    description: '사역 이력 시작일',
    required: false,
  })
  @IsOptional()
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: '사역 이력 종료일',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @ValidateIf((o) => o.startDate)
  @IsAfterDate('startDate')
  endDate: Date;
}
