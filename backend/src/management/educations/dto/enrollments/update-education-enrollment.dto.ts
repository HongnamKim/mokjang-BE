import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationEnrollmentModel } from '../../../entity/education/education-enrollment.entity';
import { EducationStatus } from '../../const/education-status.enum';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateEducationEnrollmentDto extends PickType(
  EducationEnrollmentModel,
  ['status'],
) {
  @ApiProperty({
    description: '교육 이수 상태',
    enum: EducationStatus,
    required: false,
  })
  @IsEnum(EducationStatus)
  @IsOptional()
  override status: EducationStatus;

  @ApiProperty({
    description: '비고',
    required: false,
    maxLength: 120,
  })
  @IsString()
  @IsOptional()
  @MaxLength(120)
  @Transform(({ value }) => value?.trim() ?? '')
  note: string;
}
