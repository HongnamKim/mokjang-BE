import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class ApproveJoinRequestDto {
  @ApiProperty({
    description: '연결할 교인 데이터 ID',
    required: true,
  })
  @IsNumber()
  @Min(1)
  linkMemberId: number;
}
