import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { VisitationMethod } from '../const/visitation-method.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VisitationStatus } from '../const/visitation-status.enum';
import { VisitationDetailValidator } from '../decorator/visitation-detail.validator';
import { VisitationDetailDto } from './visittion-detail.dto';
import { RemoveSpaces } from '../../common/decorator/transformer/remove-spaces';
import { SanitizeDto } from '../../common/decorator/sanitize-target.decorator';

@SanitizeDto()
export class CreateVisitationDto {
  @ApiProperty({
    description: 'API 테스트 시 true (심방 진행자의 권한 체크 건너뛰기)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isTest: boolean = false;

  @ApiProperty({
    description: '심방 상태 (예약 / 완료 / 지연)',
    enum: VisitationStatus,
  })
  @IsEnum(VisitationStatus)
  visitationStatus: VisitationStatus;

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
  @Length(2, 50)
  visitationTitle: string;

  @ApiProperty({
    description: '심방 진행자 ID',
  })
  @IsNumber()
  @Min(1)
  instructorId: number;

  @ApiProperty({
    description: '심방 날짜',
  })
  @IsDate()
  visitationDate: Date;

  @ApiProperty({
    description: '심방 세부 정보',
    type: VisitationDetailDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => VisitationDetailDto)
  @VisitationDetailValidator()
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
  receiverIds?: number[];
}
