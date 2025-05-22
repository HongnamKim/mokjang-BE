import { ApiProperty } from '@nestjs/swagger';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { RemoveSpaces } from '../../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { PlainTextMaxLength } from '../../../../common/decorator/validator/plain-text-max-length.validator';

@SanitizeDto()
export class UpdateEducationDto {
  @ApiProperty({
    description: '교육 이름 (최대 50자)',
    maxLength: 50,
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @MaxLength(50)
  @IsNoSpecialChar()
  name?: string;

  @ApiProperty({
    description: '교육 설명 (최대 500자, 빈 문자열 허용)',
    maxLength: 500,
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(500)
  description?: string;
}
