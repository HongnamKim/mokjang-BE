import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsNoSpecialChar } from '../../../common/decorator/validator/is-title.decorator';
import { Transform } from 'class-transformer';

export class CreateGroupRoleDto {
  @ApiProperty({
    name: 'role',
    description: '그룹 내 역할 이름',
  })
  @IsString()
  @IsNotEmpty()
  @IsNoSpecialChar()
  @Transform(({ value }) => value.replaceAll(' ', ''))
  role: string;
}
