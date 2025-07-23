import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';

export class AddMembersToOfficerDto {
  @ApiProperty({
    description: '추가할 교인 ID 배열',
    isArray: true,
  })
  @IsArray()
  @ArrayUnique()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  memberIds: number[];
}
