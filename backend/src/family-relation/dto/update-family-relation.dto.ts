import { PickType } from '@nestjs/swagger';
import { CreateFamilyRelationDto } from './create-family-relation.dto';

export class UpdateFamilyRelationDto extends PickType(CreateFamilyRelationDto, [
  'relation',
]) {}
