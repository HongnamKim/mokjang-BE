import { ApiProperty, PickType } from '@nestjs/swagger';
import { RequestInfoModel } from '../entity/request-info.entity';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { TransformName } from '../../decorator/transform-name';

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
  @TransformName()
  override name: string;

  @ApiProperty({
    name: 'mobilePhone',
    description: '휴대전화 번호',
    example: '01012341234',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 11)
  override mobilePhone: string;
}
