import { BaseOffsetPaginationRequestDto } from '../../../../../common/dto/request/base-offset-pagination-request.dto';
import { EducationSessionReportOrderEnum } from '../../../../const/education-session-report-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { QueryBoolean } from '../../../../../common/decorator/transformer/query-boolean.decorator';

export class GetEducationSessionReportDto extends BaseOffsetPaginationRequestDto<EducationSessionReportOrderEnum> {
  @ApiProperty({
    description: '정렬 기준',
    enum: EducationSessionReportOrderEnum,
    default: EducationSessionReportOrderEnum.createdAt,
    required: false,
  })
  @IsOptional()
  @IsEnum(EducationSessionReportOrderEnum)
  order: EducationSessionReportOrderEnum =
    EducationSessionReportOrderEnum.createdAt;

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
