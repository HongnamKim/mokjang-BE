import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TransformNumberArray } from '../../../common/decorator/transformer/transform-array';
import { VisitationStatus } from '../../const/visitation-status.enum';
import { VisitationMethod } from '../../const/visitation-method.enum';
import { RemoveSpaces } from '../../../common/decorator/transformer/remove-spaces';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';
import { IsNoSpecialChar } from '../../../common/decorator/validator/is-no-special-char.validator';
import { IsOptionalNotNull } from '../../../common/decorator/validator/is-optional-not.null.validator';
import { IsDateTime } from '../../../common/decorator/validator/is-date-time.validator';

export class UpdateVisitationDto {
  @ApiProperty({
    description: '심방 상태 (예약 / 완료 / 지연)',
    enum: VisitationStatus,
    required: false,
  })
  @IsOptionalNotNull()
  @IsEnum(VisitationStatus)
  status?: VisitationStatus;

  @ApiProperty({
    description: '심방 방식 (대면 / 비대면)',
    enum: VisitationMethod,
    required: false,
  })
  @IsOptionalNotNull()
  @IsEnum(VisitationMethod)
  visitationMethod?: VisitationMethod;

  @ApiProperty({
    description: '심방 제목',
    maxLength: 50,
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @IsNoSpecialChar()
  @Length(2, 50)
  title?: string;

  @ApiProperty({
    description: '심방 진행자 교인 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  inChargeId?: number;

  @ApiProperty({
    description: '심방 날짜 (yyyy-MM-ddTHH:mm:ss)',
    required: false,
  })
  @IsOptionalNotNull()
  //@IsDate()
  @IsDateString({ strict: true })
  @IsDateTime('startDate')
  startDate?: string; //Date;

  @ApiProperty({
    description: '심방 종료 날짜 (yyyy-MM-ddTHH:mm:ss)',
    required: false,
  })
  @IsOptionalNotNull()
  //@IsDate()
  @IsDateString({ strict: true })
  @IsDateTime('endDate')
  @IsAfterDate('startDate')
  endDate?: string; //Date;

  @ApiProperty({
    description: '심방 대상자 교인 ID',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @TransformNumberArray()
  memberIds?: number[];
}
