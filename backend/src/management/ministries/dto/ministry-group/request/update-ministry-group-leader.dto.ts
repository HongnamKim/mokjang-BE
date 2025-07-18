import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateMinistryGroupLeaderDto {
  @ApiProperty({
    description: '새로운 사역그룹장 교인 ID',
  })
  @IsNumber()
  @Min(1)
  newMinistryGroupLeaderId: number;
}
