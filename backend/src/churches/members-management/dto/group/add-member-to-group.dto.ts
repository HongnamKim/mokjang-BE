import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, Min } from 'class-validator';
import { IsValidHistoryDate } from '../../decorator/is-valid-history-date.decorator';
import { TransformStartDate } from '../../decorator/transform-start-date.decorator';

export class AddMemberToGroupDto {
  @ApiProperty({
    description: '그룹 ID',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  groupId: number;

  @ApiProperty({
    description: '그룹 내 역할 ID',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  groupRoleId: number;

  @ApiProperty({
    description: '그룹 시작일',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  @IsValidHistoryDate()
  @TransformStartDate()
  startDate: Date = new Date();
}
