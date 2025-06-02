import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TransformNumberArray } from '../../common/decorator/transformer/transform-array';
import { VisitationStatus } from '../const/visitation-status.enum';
import { VisitationMethod } from '../const/visitation-method.enum';
import { RemoveSpaces } from '../../common/decorator/transformer/remove-spaces';
import { IsAfterDate } from '../../common/decorator/validator/is-after-date.decorator';
import { IsNoSpecialChar } from '../../common/decorator/validator/is-no-special-char.validator';
import { IsOptionalNotNull } from '../../common/decorator/validator/is-optional-not.null.validator';

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
    description: '심방 날짜',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    description: '심방 종료 날짜',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDate()
  @IsAfterDate('startDate')
  endDate?: Date;

  /*@ApiProperty({
    description: '심방 대상자 추가할 교인 ID 들',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @TransformNumberArray()
  addMemberIds?: number[];

  @ApiProperty({
    description: '심방 대상자 제거할 교인 ID 들',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @TransformNumberArray()
  deleteMemberIds?: number[];*/

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
