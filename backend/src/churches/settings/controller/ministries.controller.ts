import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SettingsService } from '../service/settings.service';
import { MinistryModel } from '../entity/ministry.entity';
import { CreateSettingDto } from '../dto/create-setting.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';

@ApiTags('Settings:Ministries')
@Controller('ministries')
export class MinistriesController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getMinistries(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.settingsService.getSettingValues(churchId, MinistryModel);
  }

  @Post()
  postMinistries(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateSettingDto,
  ) {
    return this.settingsService.postSettingValues(churchId, dto, MinistryModel);
  }

  @Patch(':ministryId')
  patchMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.settingsService.updateSettingValue(
      churchId,
      ministryId,
      dto,
      MinistryModel,
    );
  }

  @Delete(':ministryId')
  deleteMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
  ) {
    return this.settingsService.deleteSettingValue(
      churchId,
      ministryId,
      MinistryModel,
    );
  }
}
