import { BaseCursorPaginationRequestDto } from '../../../common/dto/request/base-cursor-pagination-request.dto';
import { SimpleMemberOrder } from '../request/get-simple-members.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptionalNotNull } from '../../../common/decorator/validator/is-optional-not.null.validator';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class GetSimpleMemberListDto extends BaseCursorPaginationRequestDto<SimpleMemberOrder> {
  @ApiPropertyOptional({
    enum: SimpleMemberOrder,
    description: '정렬 기준 컬럼',
    default: SimpleMemberOrder.REGISTERED_AT,
  })
  @IsOptional()
  @IsEnum(SimpleMemberOrder)
  sortBy: SimpleMemberOrder = SimpleMemberOrder.REGISTERED_AT;

  @ApiPropertyOptional({
    description: '교인 이름',
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    description: '교인 휴대전화 번호',
  })
  @IsOptionalNotNull()
  @IsNotEmpty()
  @MaxLength(15)
  mobilePhone?: string;
}
