import { PickType } from '@nestjs/swagger';
import { CreateGroupDto } from './create-group.dto';

export class UpdateGroupNameDto extends PickType(CreateGroupDto, ['name']) {}
