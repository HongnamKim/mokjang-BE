import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { MemberModel } from '../entity/member.entity';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { TransformName } from '../../decorator/transform-name';

export class GetMemberDto extends PartialType(PickType(MemberModel, ['name'])) {
  @ApiProperty({
    name: 'take',
    description: '조회할 데이터 개수',
    default: 50,
    example: 50,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  take: number = 50;

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
    name: 'name',
    description: '이름 검색어',
    example: '이름',
    required: false,
  })
  @IsString()
  @TransformName()
  @IsOptional()
  override name?: string;
}
