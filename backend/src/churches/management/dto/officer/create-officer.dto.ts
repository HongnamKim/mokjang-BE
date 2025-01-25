import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { TransformName } from '../../../decorator/transform-name';

export class CreateOfficerDto {
  @ApiProperty({
    name: 'name',
    description: '생성하고자 하는 이름',
    example: '장로',
  })
  @IsString()
  @IsNotEmpty()
  @TransformName()
  name: string;
}
