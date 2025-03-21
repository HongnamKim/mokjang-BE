import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationModel } from '../../../entity/education/education.entity';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TransformName } from '../../../../churches/decorator/transform-name';

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
  @TransformName()
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9가-힣 \-]+$/, {
    message: '특수문자는 사용할 수 없습니다.',
  })
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
