import { ApiProperty, PickType } from '@nestjs/swagger';
import { InvitationModel } from '../entity/invitation.entity';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TransformName } from '../../decorator/transform-name';

export class CreateInvitationDto extends PickType(InvitationModel, [
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
  /*
  @ApiProperty({
    name: 'birth',
    description: '생년월일',
    example: '2000-01-01',
    required: false,
  })
  @IsDate()
  @IsOptional()
  birth: Date;

  @ApiProperty({
    name: 'gender',
    description: '성별',
    enum: GenderEnum,
    example: GenderEnum.male,
    required: false,
  })
  @IsEnum(GenderEnum)
  @IsOptional()
  gender: GenderEnum;

  @ApiProperty({
    name: 'address',
    description: '도로명 주소',
    example: '경기 부천시 원미구 중동로254번길 90',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address: string;

  @ApiProperty({
    name: 'detailAddress',
    description: '상세 주소',
    example: '6층 6238호',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  detailAddress: string;

  @ApiProperty({
    name: 'homePhone',
    description: '집 전화 번호',
    example: '0317891234',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  homePhone: string;

  @ApiProperty({
    name: 'occupation',
    description: '하시는 일',
    example: '회사원',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  occupation: string;

  @ApiProperty({
    name: 'school',
    description: '학교 (미성년자일 경우)',
    example: '원미고등학교',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  school: string;

  @ApiProperty({
    name: 'marriage',
    description: '결혼',
    example: '미혼',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  marriage: string;

  @ApiProperty({
    name: 'vehicleNumber',
    description: '차량번호 4자리',
    example: ['1234'],
    type: 'array',
    required: false,
  })
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @Length(4, 4, { each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  vehicleNumber?: string[];*/
}
