import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ChurchJoinRequestStatusEnum } from '../../const/church-join-request-status.enum';
import { JoinRequestOrderEnum } from '../../const/join-request-order.enum';
import { TransformStringArray } from '../../../common/decorator/transformer/transform-array';

export class GetJoinRequestDto {
  @ApiProperty({
    description: '요청 데이터 개수',
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take: number = 20;

  @ApiProperty({
    description: '요청 페이지',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: '정렬 기준',
    enum: JoinRequestOrderEnum,
    default: JoinRequestOrderEnum.createdAt,
    required: false,
  })
  @IsOptional()
  @IsEnum(JoinRequestOrderEnum)
  order: JoinRequestOrderEnum = JoinRequestOrderEnum.createdAt;

  @ApiProperty({
    description: '정렬 오름차순 / 내림차순',
    default: 'desc',
    required: false,
  })
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  orderDirection: 'ASC' | 'DESC' | 'asc' | 'desc' = 'DESC';

  @ApiProperty({
    description: '신청 날짜 ~ 부터',
    required: false,
  })
  @IsOptional()
  @IsDate()
  fromCreatedAt?: Date;

  @ApiProperty({
    description: '신청 날짜 ~ 까지',
    required: false,
  })
  @IsOptional()
  @IsDate()
  toCreatedAt?: Date;

  @ApiProperty({
    description: '처리 상태 (PENDING, APPROVED, REJECTED, CANCELED',
    enum: ChurchJoinRequestStatusEnum,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @TransformStringArray()
  @IsEnum(ChurchJoinRequestStatusEnum, { each: true })
  status?: ChurchJoinRequestStatusEnum[];
}
