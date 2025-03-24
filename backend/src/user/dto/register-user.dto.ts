import { ApiProperty, PickType } from '@nestjs/swagger';
import { UserModel } from '../entity/user.entity';
import { IsBoolean } from 'class-validator';

export class RegisterUserDto extends PickType(UserModel, [
  'privacyPolicyAgreed',
]) {
  @ApiProperty({
    description: '개인정보 관련 동의',
    example: true,
  })
  @IsBoolean()
  override privacyPolicyAgreed: boolean;
}
