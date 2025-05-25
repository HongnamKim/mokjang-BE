import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { VisitationStatus } from '../const/visitation-status.enum';
import { TransformStringArray } from '../../common/decorator/transformer/transform-array';
import { VisitationOrderEnum } from '../const/visitation-order.enum';
import { VisitationMethod } from '../const/visitation-method.enum';
import { VisitationType } from '../const/visitation-type.enum';
import { IsAfterDate } from '../../common/decorator/validator/is-after-date.decorator';

export class GetVisitationDto {
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
    default: VisitationOrderEnum.startDate,
    required: false,
  })
  @IsOptional()
  @IsEnum(VisitationOrderEnum)
  order: VisitationOrderEnum = VisitationOrderEnum.startDate;

  @ApiProperty({
    description: '정렬 오름차순 / 내림차순',
    default: 'desc',
    required: false,
  })
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC' = 'desc';

  @ApiProperty({
    description: '심방 날짜 ~ 부터',
    required: false,
  })
  @IsOptional()
  @IsDate()
  fromStartDate?: Date;

  @ApiProperty({
    description: '심방 날짜 ~ 까지',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @IsAfterDate('fromVisitationDate')
  toStartDate?: Date;

  @ApiProperty({
    description: '심방 상태 (예약 / 완료 / 지연)',
    enum: VisitationStatus,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @TransformStringArray()
  @IsEnum(VisitationStatus, { each: true })
  status?: VisitationStatus[];

  @ApiProperty({
    description: '심방 방식 (대면 / 비대면)',
    enum: VisitationMethod,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @TransformStringArray()
  @IsEnum(VisitationMethod, { each: true })
  visitationMethod?: VisitationMethod[];

  @ApiProperty({
    description: '심방 종류 (개인 / 그룹)',
    enum: VisitationType,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @TransformStringArray()
  @IsEnum(VisitationType, { each: true })
  visitationType?: VisitationType[];

  @ApiProperty({
    description: '심방 제목',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: '심방 진행자의 교인 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  inChargeId?: number;
}
