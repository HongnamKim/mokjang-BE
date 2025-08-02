import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationEnrollmentModel } from '../../entity/education-enrollment.entity';
import { IsEnum } from 'class-validator';
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
  })
  @IsEnum(EducationEnrollmentStatus)
  override status: EducationEnrollmentStatus;
}
