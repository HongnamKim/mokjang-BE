import { PartialType } from '@nestjs/swagger';
import { CreateEducationHistoryDto } from './create-education-history.dto';

export class UpdateEducationHistoryDto extends PartialType(
  CreateEducationHistoryDto,
) {}
