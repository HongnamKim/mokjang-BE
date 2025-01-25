import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { EducationEnrollmentOrderEnum } from '../../../const/education/order.enum';
import { ApiProperty } from '@nestjs/swagger';

export class GetEducationEnrollmentDto {
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
}
