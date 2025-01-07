import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber, IsOptional, Min } from 'class-validator';
import { IsValidHistoryDate } from '../../validator/is-valid-start-date.decorator';

export class CreateGroupHistoryDto {
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
    required: true,
  })
  @IsDate()
  @IsValidHistoryDate()
  startDate: Date;

  @ApiProperty({
    description: '그룹 종료일',
    required: false,
  })
  @IsDate()
  @IsValidHistoryDate()
  @IsOptional()
  endDate: Date;

  @ApiProperty({
    description: '이전 그룹이 있을 경우 오늘 날짜로 종료날짜 업데이트',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  autoEndDate: boolean;
}
