import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../const/user-role.enum';

export class UpdateUserDto {
  /*@IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  mobilePhone?: string;*/

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
