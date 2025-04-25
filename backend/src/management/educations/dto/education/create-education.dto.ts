import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationModel } from '../../entity/education.entity';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { RemoveSpaces } from '../../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-title.decorator';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';

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
    description: '교육 설명 (최대 300자, 빈 문자열 허용)',
    maxLength: 300,
    required: false,
  })
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) => value?.trim() ?? '')
  @IsOptional()
  override description: string;
}
