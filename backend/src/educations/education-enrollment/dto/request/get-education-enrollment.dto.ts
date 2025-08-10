import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { EducationEnrollmentOrder } from '../../const/education-enrollment-order.enum';
import { EducationEnrollmentStatus } from '../../const/education-enrollment-status.enum';

export class GetEducationEnrollmentDto {
  @ApiProperty({
    description: '요청 데이터 개수',
    default: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take: number = 20;

  @ApiProperty({
    description: '요청 페이지',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: '정렬 기준',
    required: false,
    enum: EducationEnrollmentOrder,
    default: EducationEnrollmentOrder.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(EducationEnrollmentOrder)
  order: EducationEnrollmentOrder = EducationEnrollmentOrder.CREATED_AT;

  @ApiProperty({
    description: '정렬 내림차순 / 오름차순',
    required: false,
    default: 'ASC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDirection: 'ASC' | 'DESC' = 'ASC';

  @ApiProperty({
    description: '수강 교인 이름',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  memberName?: string;

  @ApiProperty({
    description: '수료 상태 필터링',
    required: false,
    enum: EducationEnrollmentStatus,
  })
  @IsOptionalNotNull()
  @IsEnum(EducationEnrollmentStatus)
  status?: EducationEnrollmentStatus;
}
