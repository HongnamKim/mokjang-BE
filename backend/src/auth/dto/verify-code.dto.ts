import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({
    description: '인증 번호',
    example: '123456',
  })
  @Length(6, 6)
  code: string;
}
