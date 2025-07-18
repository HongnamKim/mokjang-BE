import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsOptionalNotNull } from '../../../../../common/decorator/validator/is-optional-not.null.validator';

export class MemberMinistryAssignmentDto {
  @ApiProperty({
    description: '교인 ID',
  })
  @IsNumber()
  @Min(1)
  memberId: number;

  @ApiProperty({
    description: '사역 ID',
    required: false,
  })
  @IsOptionalNotNull()
  @IsNumber()
  @Min(1)
  ministryId?: number;
}

export class AddMemberToMinistryGroupDto {
  @ApiProperty({
    type: MemberMinistryAssignmentDto,
    example: [
      { memberId: 1, ministryId: 5 },
      { memberId: 2 },
      { memberId: 3, ministryId: 6 },
    ],
  })
  @Type(() => MemberMinistryAssignmentDto)
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  members: MemberMinistryAssignmentDto[];
}
