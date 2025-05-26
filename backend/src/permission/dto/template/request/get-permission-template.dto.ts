import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { PermissionTemplateOrder } from '../../../const/permission-template-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class GetPermissionTemplateDto extends BaseOffsetPaginationRequestDto<PermissionTemplateOrder> {
  @ApiProperty({
    description: '정렬 기준 (생성일 / 수정일 / 이름 / 소속 교인 수)',
    enum: PermissionTemplateOrder,
    default: PermissionTemplateOrder.CREATEDAT,
    required: false,
  })
  @IsOptional()
  @IsEnum(PermissionTemplateOrder)
  order: PermissionTemplateOrder = PermissionTemplateOrder.CREATEDAT;
}
