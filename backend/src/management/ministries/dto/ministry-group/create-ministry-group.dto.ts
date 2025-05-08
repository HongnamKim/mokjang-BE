import { ApiProperty, PickType } from '@nestjs/swagger';
import { MinistryGroupModel } from '../../entity/ministry-group.entity';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { RemoveSpaces } from '../../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-title.decorator';

export class CreateMinistryGroupDto extends PickType(MinistryGroupModel, [
  'name',
  'parentMinistryGroupId',
]) {
  @ApiProperty({
    name: 'name',
    description: '사역 그룹 이름',
    example: '사역그룹',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @IsNoSpecialChar()
  override name: string;

  @ApiProperty({
    description: '상위 그룹 ID',
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  override parentMinistryGroupId: number | null;
}
