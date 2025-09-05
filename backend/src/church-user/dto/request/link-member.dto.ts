import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class LinkMemberDto {
  @ApiProperty({
    description: '변경할 교인 ID',
  })
  @IsNumber()
  @Min(1)
  memberId: number;
}
