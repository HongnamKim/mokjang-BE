import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TransformName } from '../../decorator/transform-name';
import { GenderEnum } from '../enum/gender.enum';

export class CreateBelieverDto {
  @ApiProperty({
    name: 'invitationId',
    description: '초대로 만들어지는 경우 초대의 ID',
    example: 12,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  invitationId: number;

  @ApiProperty({
    name: 'name',
    description: '성도 이름',
    example: '성도',
  })
  @IsString()
  @TransformName()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    name: 'mobilePhone',
    description: '휴대전화 번호',
    example: '01012341234',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 11)
  mobilePhone: string;

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
    example: '1234',
    required: false,
  })
  @IsString()
  @Length(4)
  @IsNotEmpty()
  @IsOptional()
  vehicleNumber: string;
}
