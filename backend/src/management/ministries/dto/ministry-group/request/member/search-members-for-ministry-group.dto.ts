import { UnassignedMemberOrder } from '../../../../const/unassigned-member-order.enum';
import { BaseOffsetPaginationRequestDto } from '../../../../../../common/dto/request/base-offset-pagination-request.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { IsOptionalNotNull } from '../../../../../../common/decorator/validator/is-optional-not.null.validator';

export class SearchMembersForMinistryGroupDto extends BaseOffsetPaginationRequestDto<UnassignedMemberOrder> {
  @ApiProperty({
    description: '조회할 데이터 개수',
    default: 20,
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take: number = 20;

  @ApiProperty({
    description: '정렬 기준',
    enum: UnassignedMemberOrder,
    default: UnassignedMemberOrder.REGISTERED_AT,
    required: false,
  })
  @IsOptional()
  @IsEnum(UnassignedMemberOrder)
  order: UnassignedMemberOrder = UnassignedMemberOrder.REGISTERED_AT;

  @ApiProperty({
    description: '교인 이름',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @MinLength(1)
  name: string;
}
