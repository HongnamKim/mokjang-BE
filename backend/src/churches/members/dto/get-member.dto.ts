import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { MemberModel } from '../entity/member.entity';
import {
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

export class GetMemberDto extends PartialType(PickType(MemberModel, ['name'])) {
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
    default: GetMemberOrderEnum.createdAt,
    required: false,
  })
  @IsEnum(GetMemberOrderEnum)
  @IsOptional()
  order: GetMemberOrderEnum = GetMemberOrderEnum.createdAt;

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
    name: 'name',
    description: '이름 검색어',
    example: '이름',
    required: false,
  })
  @IsString()
  @TransformName()
  @IsOptional()
  override name?: string;

  @ApiProperty({
    name: 'birthAfter',
    description: '생년월일 ~부터',
    example: '1990-01-01',
    default: '1800-01-01',
    required: false,
  })
  @IsDate()
  @IsOptional()
  birthAfter: Date = new Date('1800-01-01');

  @ApiProperty({
    name: 'birthBefore',
    description: '생년월일 ~까지',
    example: '2010-01-01',
    default: new Date(),
    required: false,
  })
  @IsDate()
  @IsOptional()
  birthBefore: Date = new Date();

  @ApiProperty({
    name: 'gender',
    description: '성별',
    enum: GenderEnum,
    required: false,
  })
  @IsEnum(GenderEnum)
  @IsOptional()
  gender?: GenderEnum;

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
    name: 'vehicleNumber',
    description: '차량번호 4자리',
    example: '1234',
    required: false,
  })
  @IsString()
  @Length(4, 4)
  @IsNotEmpty()
  @IsOptional()
  vehicleNumber?: string;

  @ApiProperty({
    name: 'groupId',
    description: '소그룹 ID',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  groupId?: number;

  @ApiProperty({
    name: 'officerId',
    description: '직분 ID',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  officerId?: number;

  @ApiProperty({
    name: 'baptism',
    description: '신급',
    enum: BaptismEnum,
    required: false,
  })
  @IsEnum(BaptismEnum)
  @IsOptional()
  baptism?: BaptismEnum;

  /**
   * TODO N:N 관계 검색
   * ministries, educations
   */
}
