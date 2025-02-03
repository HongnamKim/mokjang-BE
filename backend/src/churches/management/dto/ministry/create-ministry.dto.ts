import { ApiProperty } from '@nestjs/swagger';
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

export class CreateMinistryDto /*extends PickType(MinistryModel, [
  'name',
  'ministryGroupId',
]) */ {
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
  name: string;

  @ApiProperty({
    description:
      '지정/변경할 사역 그룹 ID (0 또는 undefined 일 경우 사역 그룹에 속하지 않음)',
    minimum: 0,
    required: false,
  })
  @Min(0)
  @IsNumber()
  @IsOptional()
  ministryGroupId: number;
}
