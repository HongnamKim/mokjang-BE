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
import { SettingsService } from '../service/settings.service';
import { EducationModel } from '../entity/education.entity';
import { CreateSettingDto } from '../dto/create-setting.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Settings:Educations')
@Controller('educations')
export class EducationsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getEducations(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.settingsService.getSettingValues(churchId, EducationModel);
  }

  @Post()
  postEducation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateSettingDto,
  ) {
    return this.settingsService.postSettingValues(
      churchId,
      dto,
      EducationModel,
    );
  }

  @Patch(':educationId')
  patchEducation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.settingsService.updateSettingValue(
      churchId,
      educationId,
      dto,
      EducationModel,
    );
  }

  @Delete(':educationId')
  deleteEducation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
  ) {
    return this.settingsService.deleteSettingValue(
      churchId,
      educationId,
      EducationModel,
    );
  }
}
