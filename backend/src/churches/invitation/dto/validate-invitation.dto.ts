import { ApiProperty, PickType } from '@nestjs/swagger';
import { InvitationModel } from '../entity/invitation.entity';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class ValidateInvitationDto extends PickType(InvitationModel, [
  'name',
  'mobilePhone',
]) {
  @ApiProperty({
    name: 'name',
    description: '새신자 이름',
    example: '새신자',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value
      .trim()
      .split('  ')
      .filter((char: string) => char)
      .map((char: string) => char.trim())
      .join(' '),
  )
  override name: string;

  @ApiProperty({
    name: 'mobilePhone',
    description: '휴대전화 번호',
    example: '01012341234',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 11)
  override mobilePhone: string;
}
