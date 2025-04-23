import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { RemoveSpaces } from '../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../common/decorator/validator/is-title.decorator';

export class CreateMinistryDto {
  @ApiProperty({
    name: 'name',
    description: '사역 이름',
    maxLength: 50,
    example: '청소',
  })
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @MaxLength(50)
  @IsNoSpecialChar()
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
  ministryGroupId: number | null;
}
