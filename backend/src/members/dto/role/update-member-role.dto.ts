import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../user/const/user-role.enum';
import { IsIn } from 'class-validator';

export class UpdateMemberRoleDto {
  @ApiProperty({
    description: '변경할 권한',
    enum: UserRole,
  })
  @IsIn([UserRole.member, UserRole.manager])
  role: UserRole.member | UserRole.manager;
}
