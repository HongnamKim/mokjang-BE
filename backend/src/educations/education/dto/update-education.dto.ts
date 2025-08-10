import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SanitizeDto } from '../../../common/decorator/sanitize-target.decorator';
import { IsOptionalNotNull } from '../../../common/decorator/validator/is-optional-not.null.validator';
import { RemoveSpaces } from '../../../common/decorator/transformer/remove-spaces';
import {
  IsBasicText,
  IsNoSpecialChar,
} from '../../../common/decorator/validator/is-no-special-char.validator';
import { PlainTextMaxLength } from '../../../common/decorator/validator/plain-text-max-length.validator';

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

  descriptionSummary: string | undefined;

  @ApiProperty({
    description: '교육 목표',
    isArray: true,
  })
  @IsOptionalNotNull()
  @MaxLength(50, { each: true })
  @ArrayMaxSize(6)
  @IsString({ each: true })
  @IsBasicText('교육목표', { each: true })
  goals?: string[];
}
