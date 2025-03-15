import { PickType } from '@nestjs/swagger';
import { CreateOfficerDto } from './create-officer.dto';

export class UpdateOfficerDto extends PickType(CreateOfficerDto, ['name']) {}
