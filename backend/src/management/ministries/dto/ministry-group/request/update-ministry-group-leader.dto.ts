import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, Min } from 'class-validator';
import { IsYYYYMMDD } from '../../../../../common/decorator/validator/is-yyyy-mm-dd.validator';

export class UpdateMinistryGroupLeaderDto {
  @ApiProperty({
    description: '새로운 사역그룹장 교인 ID',
  })
  @IsNumber()
  @Min(1)
  newMinistryGroupLeaderId: number;

  @ApiProperty({
    description: '사역 이력 시작 날짜',
  })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('startDate')
  startDate: string;
}
