import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TransformName } from '../../decorator/transform-name';
import { GenderEnum } from '../../enum/gender.enum';
import { IsValidVehicleNumber } from '../decorator/is-valid-vehicle-number.decorator';
import { BaptismEnum } from '../enum/baptism.enum';
import { FamilyRelation } from '../const/family-relation.const';

export class CreateMemberDto {
  @ApiProperty({
    name: 'name',
    description: '교인 이름',
    example: '교인',
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
    name: 'guidedById',
    description: '인도자 ID',
    example: 12,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  guidedById?: number;

  @ApiProperty({
    name: 'familyMemberId',
    description: '가족 교인 ID',
    example: 12,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  familyMemberId?: number;

  @ApiProperty({
    name: 'relation',
    description: '가족 관계',
    example: '어머니',
    default: FamilyRelation.DEFAULT,
    required: false,
  })
  @IsString()
  @IsIn(Object.values(FamilyRelation))
  @IsOptional()
  relation?: string;

  @ApiProperty({
    name: 'isLunar',
    description: '생년월일이 음력인지',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isLunar?: boolean = false;

  @ApiProperty({
    name: 'birth',
    description: '생년월일',
    example: '2000-01-01',
    required: false,
  })
  @IsDate()
  @IsOptional()
  birth?: Date;

  @ApiProperty({
    name: 'gender',
    description: '성별',
    enum: GenderEnum,
    example: GenderEnum.male,
    required: false,
  })
  @IsEnum(GenderEnum)
  @IsOptional()
  gender?: GenderEnum;

  @ApiProperty({
    name: 'address',
    description: '도로명 주소',
    example: '경기 부천시 원미구 중동로254번길 90',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;

  @ApiProperty({
    name: 'detailAddress',
    description: '상세 주소',
    example: '6층 6238호',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  detailAddress?: string;

  @ApiProperty({
    name: 'homePhone',
    description: '집 전화 번호',
    example: '0317891234',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  homePhone?: string;

  @ApiProperty({
    name: 'occupation',
    description: '하시는 일',
    example: '회사원',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  occupation?: string;

  @ApiProperty({
    name: 'school',
    description: '학교 (미성년자일 경우)',
    example: '원미고등학교',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  school?: string;

  @ApiProperty({
    name: 'marriage',
    description: '결혼',
    example: '미혼',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  marriage?: string;

  @ApiProperty({
    name: 'vehicleNumber',
    description: '차량번호 4자리',
    example: ['1234', '5432'],
    type: 'array',
    required: false,
  })
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @Length(4, 4, { each: true })
  @IsNotEmpty({ each: true })
  @IsValidVehicleNumber()
  @IsOptional()
  vehicleNumber?: string[];

  @ApiProperty({
    name: 'baptism',
    description: '신급',
    enum: BaptismEnum,
    example: BaptismEnum.baptized,
    default: BaptismEnum.default,
    required: false,
  })
  @IsEnum(BaptismEnum)
  @IsOptional()
  baptism?: BaptismEnum = BaptismEnum.default;

  @ApiProperty({
    name: 'previousChurch',
    description: '이전 교회',
    example: 'a교회',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  previousChurch?: string;
}
