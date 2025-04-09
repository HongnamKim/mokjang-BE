import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { IsValidHistoryDate } from '../../decorator/is-valid-history-date.decorator';
import { TransformStartDate } from '../../decorator/transform-start-date.decorator';
import { TransformName } from '../../../churches/decorator/transform-name';

export class SetMemberOfficerDto {
  @ApiProperty({
    description: '직분 ID',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  officerId: number;

  @ApiProperty({
    description: '임직 교회 (기본값: 현재 교회)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @TransformName()
  officerStartChurch: string;

  @ApiProperty({
    description: '직분 시작 날짜 (기본값: 현재 날짜)',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  @TransformStartDate()
  @IsValidHistoryDate()
  startDate: Date = new Date();
}
