import { ApiProperty, PickType } from '@nestjs/swagger';
import { FamilyModel } from '../../entity/family.entity';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { FamilyRelation } from '../../const/family-relation.const';

export class CreateFamilyDto extends PickType(FamilyModel, ['relation']) {
  @ApiProperty({
    name: 'familyId',
    description: '가족 교인의 ID',
    example: 12,
  })
  @IsNumber()
  familyId: number;

  @ApiProperty({
    name: 'relation',
    description: '가족 관계',
    example: '어머니',
    default: '가족',
  })
  @IsString()
  @IsIn(Object.values(FamilyRelation))
  @IsOptional()
  relation?: string;
}
