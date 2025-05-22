import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ChurchException } from '../const/exception/church.exception';

export class UpdateChurchJoinCodeDto {
  @ApiProperty({
    description: '교회 코드 (최소 6, 최대 20, 영문+숫자)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]+$/, {
    message: ChurchException.INVALID_CHURCH_CODE,
  })
  @Transform(({ value }) => value.toUpperCase())
  @Length(6, 20)
  joinCode: string;
}
