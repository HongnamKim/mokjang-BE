import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../user/const/user-role.enum';
import { IsEnum, IsIn } from 'class-validator';

export class UpdateManagerUserRoleDto {
  @ApiProperty({
    description: '변경할 UserRole (현재 NONE 만 사용 가능)',
    enum: UserRole,
    example: UserRole.NONE,
  })
  @IsEnum(UserRole)
  @IsIn([/*UserRole.MEMBER,*/ UserRole.NONE])
  userRole: UserRole = UserRole.NONE;
}
