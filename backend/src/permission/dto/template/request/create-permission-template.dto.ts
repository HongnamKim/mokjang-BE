import { ApiProperty, PickType } from '@nestjs/swagger';
import { PermissionTemplateModel } from '../../../entity/permission-template.entity';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
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
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';

@SanitizeDto()
export class CreatePermissionTemplateDto extends PickType(
  PermissionTemplateModel,
  ['title', 'description'],
) {
  @ApiProperty({
    description: '권한 유형 이름',
  })
  @IsString()
  @IsNotEmpty()
  @IsNoSpecialChar()
  @RemoveSpaces()
  @Length(
    MIN_PERMISSION_TEMPLATE_TITLE_LENGTH,
    MAX_PERMISSION_TEMPLATE_TITLE_LENGTH,
  )
  override title: string;

  @ApiProperty({ description: '권한 유형 설명' })
  @IsString()
  @IsBasicText('description')
  @Length(0, 50)
  override description: string;

  @ApiProperty({
    description: '권한 단위 ID 배열',
    isArray: true,
  })
  @Transform(({ value }) =>
    Array.isArray(value) ? Array.from(new Set(value)) : value,
  )
  @IsArray()
  @ArrayMinSize(MIN_PERMISSION_UNIT_COUNT)
  @ArrayMaxSize(MAX_PERMISSION_UNIT_COUNT)
  @IsNumber({}, { each: true })
  unitIds: number[];
}
