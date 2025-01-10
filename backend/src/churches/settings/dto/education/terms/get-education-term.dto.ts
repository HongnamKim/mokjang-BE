import { ApiProperty } from '@nestjs/swagger';
import { EducationTermOrderEnum } from '../../../const/education/order.enum';
import { IsEnum, IsIn } from 'class-validator';

export class GetEducationTermDto {
  @ApiProperty({
    description: '정렬 기준 (기본값: 기수)',
    enum: EducationTermOrderEnum,
    default: EducationTermOrderEnum.term,
    required: false,
  })
  @IsEnum(EducationTermOrderEnum)
  order: EducationTermOrderEnum = EducationTermOrderEnum.term;

  @ApiProperty({
    description: '정렬 내림차순 / 오름차순 (기본값: 오름차순)',
    default: 'asc',
    required: false,
  })
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC' = 'asc';
}
