import { PickType } from '@nestjs/swagger';
import { CreateFamilyDto } from './create-family.dto';

export class UpdateFamilyDto extends PickType(CreateFamilyDto, ['relation']) {}
