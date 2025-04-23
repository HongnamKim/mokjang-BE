import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
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
import { VisitationType } from '../const/visitation-type.enum';
import { RemoveSpaces } from '../../common/decorator/transformer/remove-spaces';

export class UpdateVisitationDto {
  @ApiProperty({
    description: '심방 상태 (예약 / 완료 / 지연)',
    enum: VisitationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(VisitationType)
  visitationStatus?: VisitationStatus;

  @ApiProperty({
    description: '심방 방식 (대면 / 비대면)',
    enum: VisitationMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(VisitationMethod)
  visitationMethod?: VisitationMethod;

  @ApiProperty({
    description: '심방 제목',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @Length(2, 50)
  visitationTitle?: string;

  @ApiProperty({
    description: '심방 진행자 교인 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  instructorId?: number;

  @ApiProperty({
    description: '심방 날짜',
    required: false,
  })
  @IsOptional()
  @IsDate()
  visitationDate?: Date;

  @ApiProperty({
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
  deleteMemberIds?: number[];

  @ApiProperty({
    description: 'API 테스트 시 true (심방 진행자의 권한 체크 건너뛰기)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isTest: boolean = false;
}
