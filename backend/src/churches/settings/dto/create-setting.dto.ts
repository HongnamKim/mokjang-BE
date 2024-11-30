import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSettingDto {
  @ApiProperty({
    name: 'name',
    description: '생성하고자 하는 이름',
    example: '장로',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.replaceAll(' ', ''))
  name: string;
}
