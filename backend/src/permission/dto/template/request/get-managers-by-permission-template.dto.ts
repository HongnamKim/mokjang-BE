import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { ManagerOrder } from '../../../../manager/const/manager-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class GetManagersByPermissionTemplateDto extends BaseOffsetPaginationRequestDto<ManagerOrder> {
  @ApiProperty({
    description: '정렬 기준',
    enum: ManagerOrder,
    required: false,
  })
  @IsOptional()
  @IsEnum(ManagerOrder)
  order: ManagerOrder = ManagerOrder.JOINED_AT;
}
