import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateGroupHistoryDto } from './create-group-history.dto';

export class UpdateGroupHistoryDto extends OmitType(
  PartialType(CreateGroupHistoryDto),
  ['autoEndDate'],
) {}
