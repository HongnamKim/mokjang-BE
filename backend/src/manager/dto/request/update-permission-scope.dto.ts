import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdatePermissionScopeDto {
  @ApiProperty({
    description: '권한 유형의 범위',
    isArray: true,
  })
  @IsNumber({}, { each: true })
  @IsArray()
  groupIds: number[];

  @ApiProperty({
    description: '전체 범위',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isAllGroups: boolean = false;
}
