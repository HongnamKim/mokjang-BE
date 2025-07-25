import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, Min } from 'class-validator';
import { IsYYYYMMDD } from '../../../../common/decorator/validator/is-yyyy-mm-dd.validator';

export class UpdateGroupLeaderDto {
  @ApiProperty({
    description: '리더로 지정할 교인 ID',
  })
  @IsNumber()
  @Min(1)
  newLeaderMemberId: number;

  @ApiProperty({
    description: '이력 시작 날짜',
    required: true,
  })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('startDate')
  startDate: string;
}
