import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Gender } from '../../const/enum/gender.enum';
import { Baptism } from '../../const/enum/baptism.enum';
import { FamilyRelationConst } from '../../../family-relation/family-relation-domain/const/family-relation.const';
import { Marriage } from '../../const/enum/marriage.enum';
import { RemoveSpaces } from '../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../common/decorator/validator/is-no-special-char.validator';
import { IsOptionalNotNull } from '../../../common/decorator/validator/is-optional-not.null.validator';
import { IsYYYYMMDD } from '../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { Transform } from 'class-transformer';

export class CreateMemberDto {
  @ApiProperty({
    name: 'registeredAt',
    description: '교회 등록일자 (YYYY-MM-DD)',
    default: new Date().toISOString().slice(0, 10),
  })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('registeredAt')
  @IsOptional()
  registeredAt?: string;

  utcRegisteredAt?: Date;

  @ApiProperty({
    description: '프로필 이미지 url',
    required: false,
  })
  @IsOptionalNotNull()
  @ValidateIf((_, value) => typeof value === 'string' && value.length > 0)
  @IsUrl()
  profileImageUrl?: string;

  @ApiProperty({
    name: 'name',
    description: '교인 이름',
    example: '교인',
  })
  @IsString()
  @RemoveSpaces()
  @IsNotEmpty()
  @IsNoSpecialChar()
  @MaxLength(30)
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
    example: FamilyRelationConst.MOTHER,
    required: false,
  })
  @IsString()
  @IsIn(Object.values(FamilyRelationConst))
  @IsOptional()
  relation?: string = FamilyRelationConst.FAMILY;

  @ApiProperty({
    name: 'isLunar',
    description: '생년월일이 음력인지',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isLunar?: boolean;

  @ApiProperty({
    description: '윤달 여부',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isLeafMonth?: boolean;

  @ApiProperty({
    name: 'birth',
    description: '생년월일 (YYYY-MM-DD)',
    example: '2000-01-01',
    required: false,
  })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('birth')
  @IsOptional()
  birth?: string;

  utcBirth?: Date;

  @ApiProperty({
    name: 'gender',
    description: '성별',
    enum: Gender,
    example: Gender.MALE,
    required: false,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    name: 'address',
    description: '도로명 주소',
    example: '경기 부천시 원미구 중동로254번길 90',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(50)
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
  @MaxLength(50)
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
  @MaxLength(15)
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
  @Matches(/^[a-zA-Z0-9가-힣 \-]+$/, {
    message: '특수문자는 사용할 수 없습니다.',
  })
  @MaxLength(30)
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
  @Matches(/^[a-zA-Z0-9가-힣 \-]+$/, {
    message: '특수문자는 사용할 수 없습니다.',
  })
  @MaxLength(30)
  school?: string;

  @ApiProperty({
    name: 'marriage',
    description: '결혼',
    example: Marriage.SINGLE,
    enum: Marriage,
    required: false,
  })
  @IsEnum(Marriage)
  @IsNotEmpty()
  @IsOptional()
  marriage?: Marriage;

  @ApiProperty({
    description: '결혼 상세',
    required: false,
  })
  @IsString()
  @MaxLength(30)
  detailMarriage?: string;

  @ApiProperty({
    name: 'vehicleNumber',
    description: '차량번호',
    example: ['1234', '141부5432'],
    type: 'array',
    required: false,
  })
  @Transform(({ value }) => value.map((item) => item.replace(' ', '')))
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @Length(4, 10, { each: true })
  @IsNotEmpty({ each: true })
  //@IsValidVehicleNumber()
  @IsOptional()
  vehicleNumber?: string[];

  @ApiProperty({
    name: 'baptism',
    description: '신급',
    enum: Baptism,
    example: Baptism.BAPTIZED,
    default: Baptism.NONE,
    required: false,
  })
  @IsEnum(Baptism)
  @IsOptional()
  baptism?: Baptism;

  /*@ApiProperty({
    name: 'previousChurch',
    description: '이전 교회',
    example: 'a교회',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(30)
  previousChurch?: string;*/
}
