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
import { PositionModel } from '../entity/position.entity';
import { CreateSettingDto } from '../dto/create-setting.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';

@ApiTags('Settings:Positions')
@Controller('positions')
export class PositionsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getPosition(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.settingsService.getSettingValues(churchId, PositionModel);
  }

  @Post()
  postPosition(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateSettingDto,
  ) {
    return this.settingsService.postSettingValues(churchId, dto, PositionModel);
  }

  @Patch(':positionId')
  patchPosition(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('positionId', ParseIntPipe) positionId: number,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.settingsService.updateSettingValue(
      churchId,
      positionId,
      dto,
      PositionModel,
    );
  }

  @Delete(':positionId')
  deletePosition(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('positionId', ParseIntPipe) positionId: number,
  ) {
    return this.settingsService.deleteSettingValue(
      churchId,
      positionId,
      PositionModel,
    );
  }
}
