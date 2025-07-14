import { PickType } from '@nestjs/swagger';
import { CreateOfficerDto } from './create-officer.dto';

export class UpdateOfficerNameDto extends PickType(CreateOfficerDto, [
  'name',
]) {}
