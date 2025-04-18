import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ChurchJoinRequestException } from '../../const/exception/church.exception';

export class CreateJoinRequestDto {
  @ApiProperty({
    description: '교회 가입 코드',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]+$/, {
    message: ChurchJoinRequestException.INVALID_CHURCH_CODE,
  })
  @Transform(({ value }) => value.toUpperCase())
  @Length(6, 20, { message: ChurchJoinRequestException.INVALID_CHURCH_CODE })
  joinCode: string;
}
