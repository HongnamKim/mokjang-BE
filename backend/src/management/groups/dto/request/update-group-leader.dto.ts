import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateGroupLeaderDto {
  @ApiProperty({
    description: '리더로 지정할 교인 ID',
  })
  @IsNumber()
  @Min(1)
  newLeaderMemberId: number;
}
