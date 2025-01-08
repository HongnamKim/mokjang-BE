import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { EducationOrderEnum } from '../../const/education/education-order.enum';

export class GetEducationDto {
  @ApiProperty({
    description: '정렬 기준 (이름, 생성일, 수정일)',
    enum: EducationOrderEnum,
    default: EducationOrderEnum.name,
    required: false,
  })
  @IsEnum(EducationOrderEnum)
  @IsOptional()
  order: EducationOrderEnum = EducationOrderEnum.name;

  @ApiProperty({
    description: '정렬 내림차순 / 오름차순',
    default: 'asc',
    required: false,
  })
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @IsOptional()
  orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC' = 'asc';
}
