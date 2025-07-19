import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { RemoveSpaces } from '../../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-no-special-char.validator';

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

  /*@ApiProperty({
    description: '지정할 사역 그룹 ID',
    minimum: 1,
  })
  @Min(1)
  @IsNumber()
  ministryGroupId: number;*/
}
