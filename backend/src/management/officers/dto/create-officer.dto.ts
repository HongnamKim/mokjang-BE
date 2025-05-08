import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RemoveSpaces } from '../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../common/decorator/validator/is-title.decorator';

export class CreateOfficerDto {
  @ApiProperty({
    name: 'name',
    description:
      '<p>직분 이름</p>' + '<p>특수문자 불가, 띄어쓰기 사용 시 제거</p>',
    example: '장로',
  })
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @IsNoSpecialChar()
  name: string;
}
