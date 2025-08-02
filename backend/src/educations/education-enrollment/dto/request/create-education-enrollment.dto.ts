import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';

@SanitizeDto()
export class CreateEducationEnrollmentDto {
  @ApiProperty({
    description: '수강 대상자 ID 배열',
    isArray: true,
  })
  @IsNumber({}, { each: true })
  @IsArray()
  @ArrayUnique()
  @ArrayMinSize(1)
  @Min(1, { each: true })
  memberIds: number[];

  /*@ApiProperty({
    description: '교육 상태 (수료중/수료/미수료)',
    enum: EducationEnrollmentStatus,
    default: EducationEnrollmentStatus.INCOMPLETE,
    required: false,
  })
  @IsOptional()
  @IsEnum(EducationEnrollmentStatus)
  status: EducationEnrollmentStatus = EducationEnrollmentStatus.INCOMPLETE;*/

  /*@ApiProperty({
    description: '비고',
    required: false,
    maxLength: 120,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(120)
  note: string;*/
}
