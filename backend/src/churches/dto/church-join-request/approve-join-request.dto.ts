import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsEnum, IsNumber, Min } from 'class-validator';
import {
  AssignableChurchUserRole,
  ChurchUserRole,
  UserRole,
} from '../../../user/const/user-role.enum';

export class ApproveJoinRequestDto {
  @ApiProperty({
    description: '연결할 교인 데이터 ID',
    required: true,
  })
  @IsNumber()
  @Min(1)
  linkMemberId: number;

  @ApiProperty({
    description: 'UserRole',
    enum: AssignableChurchUserRole,
  })
  @IsEnum(AssignableChurchUserRole)
  @Equals(ChurchUserRole.MANAGER)
  userRole: ChurchUserRole;
}
