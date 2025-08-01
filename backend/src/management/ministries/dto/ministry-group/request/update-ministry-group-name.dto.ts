import { PickType } from '@nestjs/swagger';
import { CreateMinistryGroupDto } from './create-ministry-group.dto';

export class UpdateMinistryGroupNameDto extends PickType(
  CreateMinistryGroupDto,
  ['name'],
) {}
