import { PickType } from '@nestjs/swagger';
import { CreateMinistryDto } from './create-ministry.dto';

export class UpdateMinistryDto extends PickType(CreateMinistryDto, ['name']) {}
