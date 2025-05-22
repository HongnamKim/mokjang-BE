import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TransferMainAdminDto {
  @ApiProperty({
    description: '새로운 mainAdmin 이 될 교인의 ID',
  })
  @IsNumber()
  newMainAdminMemberId: number;
}
