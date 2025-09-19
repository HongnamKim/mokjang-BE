import { BaseOffsetPaginationRequestDto } from '../../../common/dto/request/base-offset-pagination-request.dto';
import { ManagerOrder } from '../../const/manager-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsOptionalNotNull } from '../../../common/decorator/validator/is-optional-not.null.validator';
import { QueryBoolean } from '../../../common/decorator/transformer/query-boolean.decorator';

export class GetManagersDto extends BaseOffsetPaginationRequestDto<ManagerOrder> {
  @ApiProperty({
    description:
      '정렬 기준 (교회가입일 / 교인 Role / 생성일(교회가입) / 수정일(교회가입))',
    default: ManagerOrder.JOINED_AT,
    enum: ManagerOrder,
  })
  @IsOptional()
  @IsEnum(ManagerOrder)
  order: ManagerOrder = ManagerOrder.JOINED_AT;

  @ApiProperty({
    description: '관리자 이름',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: '활성 여부',
    required: false,
  })
  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  isPermissionActive?: boolean;
}
