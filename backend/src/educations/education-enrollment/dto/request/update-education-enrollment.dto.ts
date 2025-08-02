import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationEnrollmentModel } from '../../entity/education-enrollment.entity';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { EducationEnrollmentStatus } from '../../const/education-enrollment-status.enum';

@SanitizeDto()
export class UpdateEducationEnrollmentDto extends PickType(
  EducationEnrollmentModel,
  ['status'],
) {
  @ApiProperty({
    description: '교육 이수 상태',
    enum: EducationEnrollmentStatus,
    required: false,
  })
  @IsEnum(EducationEnrollmentStatus)
  @IsOptional()
  override status: EducationEnrollmentStatus;

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
