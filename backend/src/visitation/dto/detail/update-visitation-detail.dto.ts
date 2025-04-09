import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateVisitationDetailDto } from './create-visitation-detail.dto';

export class UpdateVisitationDetailDto extends PartialType(
  OmitType(CreateVisitationDetailDto, ['memberId']),
) {}
