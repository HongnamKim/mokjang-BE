import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { IsYYYYMMDD } from '../../../../../common/decorator/validator/is-yyyy-mm-dd.validator';

export class RemoveMembersFromGroupDto {
  @ApiProperty({
    description: '제거할 교인 ID 배열',
    isArray: true,
  })
  @IsArray()
  @ArrayUnique()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  memberIds: number[];

  @ApiProperty({
    description: '그룹 이력 종료 날짜',
  })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('endDate')
  endDate: string;
}
