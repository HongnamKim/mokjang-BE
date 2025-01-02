import { ApiProperty } from '@nestjs/swagger';
import {
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
import { BaptismEnum } from '../enum/baptism.enum';
import { GetMemberOrderEnum } from '../../enum/get-member-order.enum';
import {
  TransformNumberArray,
  TransformStringArray,
} from '../decorator/transform-array';
import { MarriageOptions } from '../const/marriage-options.const';
import { QueryBoolean } from '../decorator/query-boolean.decorator';

export class GetMemberDto /*extends PartialType(PickType(MemberModel, ['name']))*/ {
  @ApiProperty({
    name: 'take',
    description: '조회할 데이터 개수',
    default: 100,
    example: 100,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  take: number = 100;

  @ApiProperty({
    name: 'page',
    description: '조회할 페이지',
    default: 1,
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @ApiProperty({
    name: 'order',
    description: '정렬 기준',
    enum: GetMemberOrderEnum,
    default: GetMemberOrderEnum.registeredAt,
    required: false,
  })
  @IsEnum(GetMemberOrderEnum)
  @IsOptional()
  order: GetMemberOrderEnum = GetMemberOrderEnum.registeredAt;

  @ApiProperty({
    name: 'orderDirection',
    description: '정렬 오름차순 / 내림차순',
    default: 'asc',
    required: false,
  })
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @IsOptional()
  orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC';

  @ApiProperty({
    required: false,
  })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__mobilePhone?: boolean;

  @ApiProperty({
    required: false,
  })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__group?: boolean;

  @ApiProperty({
    required: false,
  })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__birth?: boolean;

  @ApiProperty({
    required: false,
  })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__gender?: boolean;

  @ApiProperty({ required: false })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__officer?: boolean;

  @ApiProperty({ required: false })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__ministries?: boolean;

  @ApiProperty({ required: false })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__educations?: boolean;

  @ApiProperty({ required: false })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__marriage?: boolean;

  @ApiProperty({ required: false })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__registeredAt?: boolean;

  @ApiProperty({ required: false })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__address?: boolean;

  @ApiProperty({ required: false })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__homePhone?: boolean;

  @ApiProperty({ required: false })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__occupation?: boolean;

  @ApiProperty({ required: false })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__school?: boolean;

  @ApiProperty({ required: false })
  @QueryBoolean()
  @IsBoolean()
  @IsOptional()
  select__vehicleNumber?: boolean;

  @ApiProperty({
    description: '등록일자 ~부터',
    required: false,
  })
  @IsDate()
  @IsOptional()
  registerAfter?: Date;

  @ApiProperty({
    description: '등록일자 ~까지',
    required: false,
  })
  @IsDate()
  @IsOptional()
  registerBefore?: Date;

  @ApiProperty({
    description: '수정일자 ~부터',
    required: false,
  })
  @IsDate()
  @IsOptional()
  updateAfter?: Date;

  @ApiProperty({
    description: '수정일자 ~까지',
    required: false,
  })
  @IsDate()
  @IsOptional()
  updateBefore?: Date;

  /*@ApiProperty({
    name: 'createAfter',
    description: '생성일자 ~부터',
    //default: '1800-01-01',
    required: false,
  })
  @IsDate()
  @IsOptional()
  createAfter?: Date; // = new Date('1800-01-01');

  @ApiProperty({
    name: 'createBefore',
    description: '생성일자 ~까지',
    //default: new Date(),
    required: false,
  })
  @IsDate()
  @IsOptional()
  createBefore?: Date; // = new Date();*/

  @ApiProperty({
    name: 'name',
    description: '이름 검색어',
    required: false,
  })
  @IsString()
  @TransformName()
  @IsOptional()
  name?: string;

  @ApiProperty({
    name: 'mobilePhone',
    description: '휴대전화번호',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  mobilePhone?: string;

  /*@ApiProperty({
    name: 'marriage',
    description: '결혼 여부',
    enum: MarriageOptions,
    required: false,
  })
  @IsEnum(MarriageOptions)
  @IsOptional()
  marriage?: MarriageOptions;*/

  @ApiProperty({
    description: '결혼 여부',
    enum: MarriageOptions,
    isArray: true,
    required: false,
  })
  @TransformStringArray()
  @IsEnum(MarriageOptions, { each: true })
  @IsOptional()
  marriage?: MarriageOptions[];

  @ApiProperty({
    name: 'birthAfter',
    description: '생년월일 ~부터 ex) 1980-05-01',
    required: false,
  })
  @IsDate()
  @IsOptional()
  birthAfter?: Date;

  @ApiProperty({
    name: 'birthBefore',
    description: '생년월일 ~까지 ex) 2010-01-01',
    required: false,
  })
  @IsDate()
  @IsOptional()
  birthBefore?: Date;

  /*@ApiProperty({
    name: 'gender',
    description: '성별',
    enum: GenderEnum,
    required: false,
  })
  @IsEnum(GenderEnum)
  @IsOptional()
  gender?: GenderEnum;*/

  @ApiProperty({
    description: '성별',
    enum: GenderEnum,
    isArray: true,
    required: false,
  })
  @TransformStringArray()
  @IsEnum(GenderEnum, { each: true })
  @IsOptional()
  gender?: GenderEnum[];

  @ApiProperty({
    name: 'school',
    description: '학교',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  school?: string;

  @ApiProperty({
    name: 'address',
    description: '도로명주소',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;

  @ApiProperty({
    name: 'homePhone',
    description: '집 전화번호',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  homePhone?: string;

  @ApiProperty({
    name: 'occupation',
    description: '하시는 일',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  occupation?: string;

  @ApiProperty({
    name: 'vehicleNumber',
    description: '차량번호 4자리',
    type: String,
    isArray: true,
    required: false,
  })
  @IsString({ each: true })
  @Length(4, 4, { each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  @TransformStringArray()
  @IsOptional()
  vehicleNumber?: string[];

  @ApiProperty({
    name: 'group',
    description: '소그룹 ID',
    type: Number,
    isArray: true,
    required: false,
  })
  @TransformNumberArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  group?: number[];

  @ApiProperty({
    name: 'officer',
    description: '직분 ID',
    type: Number,
    isArray: true,
    required: false,
  })
  @TransformNumberArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  officer?: number[];

  @ApiProperty({
    name: 'ministries',
    description: '사역 ID',
    type: Number,
    isArray: true,
    required: false,
  })
  @TransformNumberArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  ministries: number[];

  @ApiProperty({
    name: 'educations',
    description: '교육 ID',
    type: Number,
    isArray: true,
    required: false,
  })
  @TransformNumberArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  educations?: number[];

  /*@ApiProperty({
    name: 'baptism',
    description: '신급',
    enum: BaptismEnum,
    required: false,
  })
  @IsEnum(BaptismEnum)
  @IsOptional()
  baptism?: BaptismEnum;*/

  @ApiProperty({
    name: 'baptism',
    description: '신급',
    enum: BaptismEnum,
    isArray: true,
    required: false,
  })
  @TransformStringArray()
  @IsEnum(BaptismEnum, { each: true })
  @IsOptional()
  baptism?: BaptismEnum[];
}
