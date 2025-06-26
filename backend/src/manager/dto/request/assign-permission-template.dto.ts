import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class AssignPermissionTemplateDto {
  @ApiProperty({ description: '부여할 권한 유형 ID' })
  @IsNumber()
  @Min(1)
  permissionTemplateId: number;
}
