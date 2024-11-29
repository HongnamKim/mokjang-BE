import { PickType } from '@nestjs/swagger';
import { CreatePositionDto } from './create-position.dto';

export class UpdatePositionDto extends PickType(CreatePositionDto, ['name']) {}
