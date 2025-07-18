import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';

export class RemoveMembersFromMinistryGroupDto {
  @ApiProperty({
    description: '사역그룹에서 제거할 교인 ID 배열',
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @Min(1, { each: true })
  @IsNumber({}, { each: true })
  memberIds: number[];
}
