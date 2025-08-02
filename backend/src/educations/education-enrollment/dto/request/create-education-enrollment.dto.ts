import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationEnrollmentModel } from '../../entity/education-enrollment.entity';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { EducationEnrollmentStatus } from '../../const/education-enrollment-status.enum';

@SanitizeDto()
export class CreateEducationEnrollmentDto extends PickType(
  EducationEnrollmentModel,
  ['memberId', 'status', 'note'],
) {
  @ApiProperty({
    description: '수강 대상자 ID',
  })
  @IsNumber()
  @Min(1)
  override memberId: number;

  @ApiProperty({
    description: '교육 상태 (수료중/수료/미수료)',
    enum: EducationEnrollmentStatus,
    default: EducationEnrollmentStatus.INCOMPLETE, //IN_PROGRESS,
    required: false,
  })
  @IsOptional()
  @IsEnum(EducationEnrollmentStatus)
  status: EducationEnrollmentStatus = EducationEnrollmentStatus.INCOMPLETE; //IN_PROGRESS;

  @ApiProperty({
    description: '비고',
    required: false,
    maxLength: 120,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(120)
  note: string;
}
