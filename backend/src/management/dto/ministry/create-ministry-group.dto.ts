import { ApiProperty, PickType } from '@nestjs/swagger';
import { MinistryGroupModel } from '../../entity/ministry/ministry-group.entity';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { TransformName } from '../../../churches/decorator/transform-name';

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
  @TransformName()
  @Matches(/^[a-zA-Z0-9가-힣 \-]+$/, {
    message: '특수문자는 사용할 수 없습니다.',
  })
  override name: string;

  @ApiProperty({
    description: '상위 그룹 ID',
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  override parentMinistryGroupId: number;
}
