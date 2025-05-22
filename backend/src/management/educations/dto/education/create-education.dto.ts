import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationModel } from '../../entity/education.entity';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { RemoveSpaces } from '../../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { PlainTextMaxLength } from '../../../../common/decorator/validator/plain-text-max-length.validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';

@SanitizeDto()
export class CreateEducationDto extends PickType(EducationModel, [
  'name',
  'description',
]) {
  @ApiProperty({
    description: '교육 이름 (최대 50자)',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @MaxLength(50)
  @IsNoSpecialChar()
  override name: string;

  @ApiProperty({
    description: '교육 설명 (최대 500자(서식 제외), 빈 문자열 허용)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(500)
  override description: string;
}
