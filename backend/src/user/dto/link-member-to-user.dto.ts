import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkMemberToUserDto {
  @ApiProperty({
    description: '연결하려는 교인 데이터의 ID',
  })
  @IsNumber()
  memberId: number;
}
