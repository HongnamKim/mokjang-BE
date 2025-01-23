import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupRoleDto {
  @ApiProperty({
    name: 'role',
    description: '그룹 내 역할 이름',
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}
