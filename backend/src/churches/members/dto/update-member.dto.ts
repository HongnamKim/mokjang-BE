import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class UpdateMemberDto extends OmitType(CreateMemberDto, [
  'name',
  'mobilePhone',
]) {
  @ApiProperty({
    name: 'ministryId',
    description: '사역 ID',
    example: 3,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  ministryId?: number;

  @ApiProperty({
    name: 'groupId',
    description: '소그룹 ID',
    example: 3,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  groupId?: number;

  @ApiProperty({
    name: 'educationId',
    description: '교육이수 ID',
    example: 3,
    required: false,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  educationId?: number[];
}