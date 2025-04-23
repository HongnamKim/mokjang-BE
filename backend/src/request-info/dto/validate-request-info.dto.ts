import { ApiProperty, PickType } from '@nestjs/swagger';
import { RequestInfoModel } from '../entity/request-info.entity';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { RemoveSpaces } from '../../common/decorator/transformer/remove-spaces';

export class ValidateRequestInfoDto extends PickType(RequestInfoModel, [
  'name',
  'mobilePhone',
]) {
  @ApiProperty({
    name: 'name',
    description: '새신자 이름',
    example: '새신자',
  })
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @Matches(/^[a-zA-Z0-9가-힣 \-]+$/, {
    message: '특수문자는 사용할 수 없습니다.',
  })
  override name: string;

  @ApiProperty({
    name: 'mobilePhone',
    description: '휴대전화 번호',
    example: '01012341234',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 11)
  @Matches(/^[0-9]+$/, { message: '숫자만 입력 가능합니다' })
  override mobilePhone: string;
}
