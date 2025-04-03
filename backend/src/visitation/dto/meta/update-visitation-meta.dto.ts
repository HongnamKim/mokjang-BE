import { PartialType } from '@nestjs/swagger';
import { CreateVisitationMetaDto } from './create-visitation-meta.dto';

export class UpdateVisitationMetaDto extends PartialType(
  CreateVisitationMetaDto,
) {}
