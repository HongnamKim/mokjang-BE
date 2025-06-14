import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

import { ChurchJoinException } from '../../exception/church-join.exception';

export class CreateJoinRequestDto {
  @ApiProperty({
    description: '교회 가입 코드',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]+$/, {
    message: ChurchJoinException.INVALID_CHURCH_CODE,
  })
  //@Transform(({ value }) => value.toUpperCase())
  @Length(6, 20, { message: ChurchJoinException.INVALID_CHURCH_CODE })
  joinCode: string;
}
