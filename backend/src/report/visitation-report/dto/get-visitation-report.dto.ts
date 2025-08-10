import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsIn, IsOptional } from 'class-validator';
import { QueryBoolean } from '../../../common/decorator/transformer/query-boolean.decorator';
import { BaseOffsetPaginationRequestDto } from '../../../common/dto/request/base-offset-pagination-request.dto';
import { ReportOrder } from '../../base-report/const/report-order.enum';

export class GetVisitationReportDto extends BaseOffsetPaginationRequestDto<ReportOrder> {
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
    description: '정렬 오름차순 / 내림차순',
    default: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDirection: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: '읽은 보고 or 읽지 않은 보고',
    required: false,
  })
  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  isRead?: boolean;
}
