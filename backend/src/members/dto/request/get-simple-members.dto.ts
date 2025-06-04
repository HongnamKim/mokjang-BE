import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsOptionalNotNull } from '../../../common/decorator/validator/is-optional-not.null.validator';
import { BaseOffsetPaginationRequestDto } from '../../../common/dto/request/base-offset-pagination-request.dto';

export enum GetSimpleMemberOrder {
  REGISTERED_AT = 'registeredAt',
}

export class GetSimpleMembersDto extends BaseOffsetPaginationRequestDto<GetSimpleMemberOrder> {
  @ApiProperty({
    description: '조회할 데이터 개수',
    default: 20,
    example: 20,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  override take: number = 20;

  @ApiProperty({
    description: '정렬 오름차순 / 내림차순',
    default: 'asc',
    required: false,
  })
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  override orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC' = 'asc';

  @ApiProperty({
    description: '정렬 기준',
    required: false,
    enum: GetSimpleMemberOrder,
    default: GetSimpleMemberOrder.REGISTERED_AT,
  })
  @IsOptional()
  @IsEnum(GetSimpleMemberOrder)
  order: GetSimpleMemberOrder = GetSimpleMemberOrder.REGISTERED_AT;

  @ApiProperty({
    description: '교인 이름',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name?: string;

  @ApiProperty({
    description: '교인 휴대전화 번호',
    required: false,
  })
  @IsOptionalNotNull()
  @IsNotEmpty()
  @MaxLength(15)
  mobilePhone?: string;
}
