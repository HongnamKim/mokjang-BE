import { ApiProperty, PickType } from '@nestjs/swagger';
import { MinistryModel } from '../../entity/ministry/ministry.entity';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { TransformName } from '../../../decorator/transform-name';

export class CreateMinistryDto extends PickType(MinistryModel, [
  'name',
  'ministryGroupId',
]) {
  @ApiProperty({
    name: 'name',
    description: '사역 이름',
    maxLength: 50,
    example: '청소',
  })
  @IsString()
  @IsNotEmpty()
  @TransformName()
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9가-힣 \-]+$/, {
    message: '특수문자는 사용할 수 없습니다.',
  })
  override name: string;

  @ApiProperty({
    description: '사역 그룹 ID',
    minimum: 1,
    required: false,
  })
  @Min(1)
  @IsNumber()
  @IsOptional()
  override ministryGroupId: number;
}
