import { PickType } from '@nestjs/swagger';
import { CreateSettingDto } from './create-setting.dto';

export class UpdateSettingDto extends PickType(CreateSettingDto, ['name']) {}
