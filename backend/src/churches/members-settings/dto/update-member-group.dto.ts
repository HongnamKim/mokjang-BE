import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateMemberGroupDto {
  @ApiProperty({
    name: 'isDeleteGroup',
    description: '교인의 그룹 삭제 시 true',
    default: false,
    required: true,
  })
  @IsBoolean()
  isDeleteGroup: boolean = false;

  @ApiProperty({
    name: 'groupId',
    description: '그룹 ID',
    example: 12,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  groupId: number;
}
