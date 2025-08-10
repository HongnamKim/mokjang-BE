import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { NotEnrolledMembersOrder } from '../../const/not-enrolled-members-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';

export class GetNotEnrolledMembersDto extends BaseOffsetPaginationRequestDto<NotEnrolledMembersOrder> {
  @ApiProperty({
    description: '정렬 조건 (등록일 고정)',
    enum: NotEnrolledMembersOrder,
    default: NotEnrolledMembersOrder.REGISTERED_AT,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotEnrolledMembersOrder)
  order: NotEnrolledMembersOrder = NotEnrolledMembersOrder.REGISTERED_AT;

  @ApiProperty({
    description: '조회할 데이터 개수',
    default: 20,
    example: 20,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  override take: number = 20;

  @ApiProperty({
    name: 'orderDirection',
    description: '정렬 오름차순 / 내림차순',
    default: 'DESC',
    required: false,
  })
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  orderDirection: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: '교인 이름',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name?: string;
}
