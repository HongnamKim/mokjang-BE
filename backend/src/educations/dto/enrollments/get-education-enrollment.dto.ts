import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { EducationEnrollmentOrderEnum } from '../../const/order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalNotNull } from '../../../common/decorator/validator/is-optional-not.null.validator';

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
    enum: EducationEnrollmentOrderEnum,
    default: EducationEnrollmentOrderEnum.memberId,
  })
  @IsOptional()
  @IsEnum(EducationEnrollmentOrderEnum)
  order: EducationEnrollmentOrderEnum = EducationEnrollmentOrderEnum.memberId;

  @ApiProperty({
    description: '정렬 내림차순 / 오름차순',
    required: false,
    default: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC' = 'asc';

  @ApiProperty({
    description: '수강 교인 이름',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  memberName?: string;
}
