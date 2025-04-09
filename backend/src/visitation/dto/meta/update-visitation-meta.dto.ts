import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateVisitationMetaDto } from './create-visitation-meta.dto';

export class UpdateVisitationMetaDto extends PartialType(
  OmitType(CreateVisitationMetaDto, ['creator']),
) {}
