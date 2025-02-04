import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { CreateChurchDto } from './create-church.dto';

export class UpdateChurchDto extends PartialType(
  OmitType(CreateChurchDto, ['name', 'identifyNumber', 'denomination']),
) {}
