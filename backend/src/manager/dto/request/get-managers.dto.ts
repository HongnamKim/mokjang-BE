import { BaseOffsetPaginationRequestDto } from '../../../common/dto/request/base-offset-pagination-request.dto';
import { ManagerOrder } from '../../const/manager-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsOptionalNotNull } from '../../../common/decorator/validator/is-optional-not.null.validator';

export class GetManagersDto extends BaseOffsetPaginationRequestDto<ManagerOrder> {
  @ApiProperty({
    description: '정렬 기준 (교회가입일 / 생성일 / 수정일)',
    default: ManagerOrder.CHURCH_JOINED_AT,
    enum: ManagerOrder,
  })
  @IsOptional()
  @IsEnum(ManagerOrder)
  order: ManagerOrder = ManagerOrder.CHURCH_JOINED_AT;

  @ApiProperty({
    description: '관리자 이름',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
