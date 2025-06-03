import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class TransferOwnerDto {
  @ApiProperty({
    description: '새로운 owner 가 될 교인의 ID',
  })
  @IsNumber()
  @Min(1)
  newOwnerMemberId: number;
}
