import { ApiProperty } from '@nestjs/swagger';
import {
  AssignableChurchUserRole,
  ChurchUserRole,
} from '../../../user/const/user-role.enum';
import { Equals, IsEnum } from 'class-validator';

export class UpdateChurchUserRoleDto {
  @ApiProperty({
    description: '수정할 교회 내 역할',
    enum: AssignableChurchUserRole,
  })
  @IsEnum(AssignableChurchUserRole)
  @Equals(ChurchUserRole.MANAGER)
  role: ChurchUserRole;
}
