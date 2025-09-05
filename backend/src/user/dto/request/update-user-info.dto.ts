import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserInfoDto {
  @ApiProperty({ description: '유저 이름' })
  @IsString()
  name: string;
}
