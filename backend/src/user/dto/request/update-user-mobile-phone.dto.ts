import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, Length } from 'class-validator';

export class UpdateUserMobilePhoneDto {
  @ApiProperty({ description: '테스트 여부' })
  @IsBoolean()
  isTest: boolean;

  @ApiProperty({ description: '변경할 휴대전화 번호' })
  @IsString()
  @Length(10, 11)
  mobilePhone: string;
}
