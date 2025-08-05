import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { VisitationOrderEnum } from '../../../visitation/const/visitation-order.enum';
import { VisitationReportOrderEnum } from '../../const/visitation-report-order.enum';
import { QueryBoolean } from '../../../common/decorator/transformer/query-boolean.decorator';

export class GetVisitationReportDto {
  @ApiProperty({
    description: '요청 데이터 개수',
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take: number = 20;

  @ApiProperty({
    description: '요청 페이지',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: '정렬 기준',
    enum: VisitationOrderEnum,
    default: VisitationReportOrderEnum.createdAt,
    required: false,
  })
  @IsOptional()
  @IsEnum(VisitationReportOrderEnum)
  order: VisitationReportOrderEnum = VisitationReportOrderEnum.createdAt;

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
