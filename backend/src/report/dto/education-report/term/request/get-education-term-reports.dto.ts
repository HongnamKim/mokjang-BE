import { BaseOffsetPaginationRequestDto } from '../../../../../common/dto/request/base-offset-pagination-request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { QueryBoolean } from '../../../../../common/decorator/transformer/query-boolean.decorator';
import { ReportOrder } from '../../../../const/report-order.enum';

export class GetEducationTermReportsDto extends BaseOffsetPaginationRequestDto<ReportOrder> {
  @ApiProperty({
    description: '정렬 기준',
    enum: ReportOrder,
    default: ReportOrder.REPORTED_AT,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReportOrder)
  order: ReportOrder = ReportOrder.REPORTED_AT;

  @ApiProperty({
    description: '읽은 보고 or 읽지 않은 보고',
    required: false,
  })
  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({
    description: '확인 처리한 보고 or 하지 않은 보고',
    required: false,
  })
  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  isConfirmed?: boolean;
}
