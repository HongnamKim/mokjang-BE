import { PartialType } from '@nestjs/swagger';
import { CreateEducationDto } from './create-education.dto';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';

@SanitizeDto()
export class UpdateEducationDto extends PartialType(CreateEducationDto) {}
