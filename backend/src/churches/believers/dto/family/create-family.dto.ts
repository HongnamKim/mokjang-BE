import { ApiProperty, PickType } from '@nestjs/swagger';
import { FamilyModel } from '../../entity/family.entity';
import { IsNumber, IsOptional, IsString } from 'class-validator';

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
  @IsOptional()
  relation?: string;
}
