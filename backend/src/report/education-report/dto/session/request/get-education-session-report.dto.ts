import { BaseOffsetPaginationRequestDto } from '../../../../../common/dto/request/base-offset-pagination-request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { QueryBoolean } from '../../../../../common/decorator/transformer/query-boolean.decorator';
import { ReportOrder } from '../../../../base-report/const/report-order.enum';

export class GetEducationSessionReportDto extends BaseOffsetPaginationRequestDto<ReportOrder> {
  @ApiProperty({
    description: '정렬 기준',
    enum: ReportOrder,
    default: ReportOrder.CREATED_AT,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReportOrder)
  order: ReportOrder = ReportOrder.CREATED_AT;

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
