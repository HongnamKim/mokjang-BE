import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class UpdateMemberMinistryDto {
  @ApiProperty({
    name: 'isDeleteMinistry',
    description: '교인의 사역 삭제 시 true',
    default: false,
    required: true,
  })
  @IsBoolean()
  isDeleteMinistry: boolean = false;

  @ApiProperty({
    name: 'ministryId',
    description: '사역 ID',
    example: 12,
  })
  @IsNumber()
  ministryId: number;
}
