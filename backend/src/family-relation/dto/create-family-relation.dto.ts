import { ApiProperty, PickType } from '@nestjs/swagger';
import { FamilyRelationModel } from '../entity/family-relation.entity';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { FamilyRelationConst } from '../family-relation-domain/const/family-relation.const';

export class CreateFamilyRelationDto extends PickType(FamilyRelationModel, [
  'familyMemberId',
  'relation',
]) {
  @ApiProperty({
    name: 'familyMemberId',
    description: '가족 교인의 ID',
    example: 12,
  })
  @IsNumber()
  familyMemberId: number;

  @ApiProperty({
    name: 'relation',
    description: '가족 관계',
    example: FamilyRelationConst.MOTHER,
    default: FamilyRelationConst.FAMILY,
  })
  @IsString()
  @IsIn(Object.values(FamilyRelationConst))
  @IsOptional()
  relation: string = FamilyRelationConst.FAMILY;
}
