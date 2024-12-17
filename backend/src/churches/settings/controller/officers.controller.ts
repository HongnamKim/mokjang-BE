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
import { OfficerModel } from '../entity/officer.entity';
import { CreateSettingDto } from '../dto/create-setting.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';

@ApiTags('Settings:Officers')
@Controller('officers')
export class OfficersController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getOfficers(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.settingsService.getSettingValues(churchId, OfficerModel);
  }

  @Post()
  postOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateSettingDto,
  ) {
    return this.settingsService.postSettingValues(churchId, dto, OfficerModel);
  }

  @Patch(':officerId')
  patchOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('officerId', ParseIntPipe) officerId: number,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.settingsService.updateSettingValue(
      churchId,
      officerId,
      dto,
      OfficerModel,
    );
  }

  @Delete(':officerId')
  deleteOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('officerId', ParseIntPipe) officerId: number,
  ) {
    return this.settingsService.deleteSettingValue(
      churchId,
      officerId,
      OfficerModel,
    );
  }
}
