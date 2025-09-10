import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { PermissionTemplateModel } from '../../../entity/permission-template.entity';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import {
  IsBasicText,
  IsNoSpecialChar,
} from '../../../../common/decorator/validator/is-no-special-char.validator';
import { RemoveSpaces } from '../../../../common/decorator/transformer/remove-spaces';
import { Transform } from 'class-transformer';
import {
  MAX_PERMISSION_TEMPLATE_TITLE_LENGTH,
  MAX_PERMISSION_UNIT_COUNT,
  MIN_PERMISSION_TEMPLATE_TITLE_LENGTH,
  MIN_PERMISSION_UNIT_COUNT,
} from '../../../constraints/permission.constraints';

export class UpdatePermissionTemplateDto extends PartialType(
  PickType(PermissionTemplateModel, ['title', 'description']),
) {
  @ApiProperty({
    description: '권한 유형 이름',
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  @IsNoSpecialChar()
  @RemoveSpaces()
  @Length(
    MIN_PERMISSION_TEMPLATE_TITLE_LENGTH,
    MAX_PERMISSION_TEMPLATE_TITLE_LENGTH,
  )
  override title?: string;

  @ApiProperty({ description: '권한 유형 설명' })
  @IsOptionalNotNull()
  @IsString()
  @IsBasicText('description')
  @Length(0, 50)
  override description?: string;

  @ApiProperty({
    description: '권한 단위 ID 배열',
    isArray: true,
    required: false,
  })
  @IsOptionalNotNull()
  @Transform(({ value }) =>
    Array.isArray(value) ? Array.from(new Set(value)) : value,
  )
  @IsArray()
  @ArrayMinSize(MIN_PERMISSION_UNIT_COUNT)
  @ArrayMaxSize(MAX_PERMISSION_UNIT_COUNT)
  unitIds?: number[];
}
