import { GetMemberDto } from './get-member.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../user/const/user-role.enum';
import { TransformStringArray } from '../../../common/decorator/transformer/transform-array';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetUserMemberDto extends GetMemberDto {
  @ApiProperty({
    description: '교인 권한 변경',
    isArray: true,
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @TransformStringArray()
  userRole?: UserRole[];
}
