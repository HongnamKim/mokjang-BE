import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInChurchDto {
  @ApiProperty({
    description: '가입하려는 교회의 ID',
  })
  @IsNumber()
  churchId: number;
}
