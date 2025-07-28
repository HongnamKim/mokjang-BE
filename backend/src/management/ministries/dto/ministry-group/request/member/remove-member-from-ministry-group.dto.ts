import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { IsYYYYMMDD } from '../../../../../../common/decorator/validator/is-yyyy-mm-dd.validator';

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

  @ApiProperty({
    description: '사역그룹 이력 종료 날짜',
  })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('endDate')
  endDate: string;
}
