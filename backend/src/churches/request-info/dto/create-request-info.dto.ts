import { ApiProperty, PickType } from '@nestjs/swagger';
import { RequestInfoModel } from '../entity/request-info.entity';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TransformName } from '../../decorator/transform-name';

export class CreateRequestInfoDto extends PickType(RequestInfoModel, [
  'name',
  'mobilePhone',
  'guideId',
  'familyId',
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

  @ApiProperty({
    name: 'guideId',
    description: '인도자 ID',
    example: 12,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  override guideId?: number;

  @ApiProperty({
    name: 'familyId',
    description: '가족 ID',
    example: 21,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  override familyId?: number;
}
