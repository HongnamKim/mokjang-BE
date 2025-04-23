import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RemoveSpaces } from '../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../common/decorator/validator/is-title.decorator';

export class CreateOfficerDto {
  @ApiProperty({
    name: 'name',
    description: '생성하고자 하는 이름',
    example: '장로',
  })
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @IsNoSpecialChar()
  name: string;
}
