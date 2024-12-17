import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class RequestVerificationCodeDto {
  @ApiProperty({
    name: 'name',
    description: '이름',
    example: '이름',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    name: 'mobilePhone',
    description: '휴대전화 번호',
    example: '01012341234',
  })
  @IsNotEmpty()
  @Length(10, 11)
  mobilePhone: string;
}
