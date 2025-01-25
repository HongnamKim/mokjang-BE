import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationEnrollmentModel } from '../../../entity/education/education-enrollment.entity';
import { EducationStatus } from '../../../const/education/education-status.enum';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
  @IsNotEmpty()
  note: string;

  @ApiProperty({
    description: '비고 삭제 시 true',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleteNote: boolean = false;
}
