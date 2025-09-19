import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { VisitationMethod } from '../../const/visitation-method.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VisitationStatus } from '../../const/visitation-status.enum';
import { VisitationDetailDto } from '../internal/visittion-detail.dto';
import { RemoveSpaces } from '../../../common/decorator/transformer/remove-spaces';
import { SanitizeDto } from '../../../common/decorator/sanitize-target.decorator';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';
import { IsNoSpecialChar } from '../../../common/decorator/validator/is-no-special-char.validator';
import { IsDateTime } from '../../../common/decorator/validator/is-date-time.validator';
import { VisitationException } from '../../const/exception/visitation.exception';
import { ReportException } from '../../../report/exception/report.exception';

@SanitizeDto()
export class CreateVisitationDto {
  @ApiProperty({
    description: '심방 상태 (예약 / 완료 / 지연)',
    enum: VisitationStatus,
  })
  @IsEnum(VisitationStatus)
  status: VisitationStatus;

  @ApiProperty({
    description: '심방 방식 (대면 / 비대면)',
    enum: VisitationMethod,
  })
  @IsEnum(VisitationMethod)
  visitationMethod: VisitationMethod;

  @ApiProperty({
    description: '심방 제목',
    maxLength: 50,
  })
  @IsString()
  @RemoveSpaces()
  @IsNoSpecialChar()
  @Length(2, 50)
  title: string;

  @ApiProperty({
    description: '심방 진행자 ID',
  })
  @IsNumber()
  @Min(1)
  inChargeId: number;

  @ApiProperty({
    description: '심방 시작 날짜 (yyyy-MM-ddTHH:mm:ss)',
  })
  @IsDateString({ strict: true })
  @IsDateTime('startDate')
  startDate: string;

  @ApiProperty({
    description: '심방 종료 날짜 (yyyy-MM-ddTHH:mm:ss)',
  })
  @IsDateString({ strict: true })
  @IsDateTime('endDate')
  @IsAfterDate('startDate')
  endDate: string;

  @ApiProperty({
    description: '심방 대상자 교인 ID 배열',
    isArray: true,
  })
  @IsArray()
  @ArrayUnique()
  @ArrayMinSize(1)
  @ArrayMaxSize(30, { message: VisitationException.EXCEED_VISITATION_MEMBER })
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  memberIds: number[];

  @ApiProperty({
    description: '심방 세부 정보',
    type: VisitationDetailDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => VisitationDetailDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(1)
  visitationDetails: VisitationDetailDto[];

  @ApiProperty({
    description: '심방 피보고자 ID',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @ArrayMaxSize(30, { message: ReportException.EXCEED_RECEIVERS })
  receiverIds?: number[];
}
