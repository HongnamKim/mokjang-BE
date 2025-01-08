import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationModel } from '../../entity/education/education.entity';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { TransformName } from '../../../decorator/transform-name';
import { Transform } from 'class-transformer';

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
    description: '교육 설명 (최대 300자)',
    maxLength: 300,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  @Transform(({ value }) => (value.trim().length === 0 ? undefined : value))
  @IsOptional()
  override description: string;
}
