import { VisitationMethod } from '../../const/visitation-method.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsString, Length } from 'class-validator';
import { VisitationType } from '../../const/visitation-type.enum';
import { TransformStartDate } from '../../../member-history/decorator/transform-start-date.decorator';

export class CreateVisitationMetaDto {
  @ApiProperty({
    description: '심방 방식 (대면 / 비대면)',
    enum: VisitationMethod,
    required: true,
  })
  @IsEnum(VisitationMethod)
  visitationMethod: VisitationMethod;

  @ApiProperty({
    description: '심방 종류 (개인 / 그룹)',
    enum: VisitationType,
    required: true,
  })
  @IsEnum(VisitationType)
  visitationType: VisitationType;

  @ApiProperty({
    description: '심방 제목',
    maxLength: 50,
    required: true,
  })
  @IsString()
  @Length(2, 50)
  visitationTitle: string;

  @ApiProperty({
    description: '진행자 ID',
    required: true,
  })
  @IsNumber()
  instructorId: number;

  @ApiProperty({
    description: '심방 날짜',
    required: true,
  })
  @IsDate()
  @TransformStartDate()
  visitationDate: Date;
}
