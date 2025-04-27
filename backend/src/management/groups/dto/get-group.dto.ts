import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNumber, IsOptional } from 'class-validator';
import { GroupOrderEnum } from '../const/group-order.enum';

export class GetGroupDto {
  @ApiProperty({
    description: '<p>부모 그룹 id</p>' + '<p>최상위 그룹 조회 시 포함 X</p>',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parentGroupId: number = 0;

  @ApiProperty({
    description: '요청 데이터 개수',
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  take: number = 20;

  @ApiProperty({
    description: '요청 페이지',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @ApiProperty({
    description: '정렬 기준 (생성일, 수정일, 이름)',
    enum: GroupOrderEnum,
    default: GroupOrderEnum.createdAt,
    required: false,
  })
  @IsEnum(GroupOrderEnum)
  @IsOptional()
  order: GroupOrderEnum = GroupOrderEnum.createdAt;

  @ApiProperty({
    description: '정렬 내림차순 / 오름차순',
    default: 'asc',
    required: false,
  })
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @IsOptional()
  orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC' = 'asc';
}
