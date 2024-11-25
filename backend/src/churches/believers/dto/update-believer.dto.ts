import { OmitType } from '@nestjs/swagger';
import { CreateBelieverDto } from './create-believer.dto';

export class UpdateBelieverDto extends OmitType(CreateBelieverDto, [
  'name',
  'mobilePhone',
]) {}
