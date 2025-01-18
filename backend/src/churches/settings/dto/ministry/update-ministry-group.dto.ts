import { PartialType } from '@nestjs/swagger';
import { CreateMinistryGroupDto } from './create-ministry-group.dto';

export class UpdateMinistryGroupDto extends PartialType(
  CreateMinistryGroupDto,
) {}
