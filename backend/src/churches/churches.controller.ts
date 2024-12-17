import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { AccessTokenGuard } from '../auth/guard/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessToken } from '../auth/decorator/jwt.decorator';
import { JwtAccessPayload } from '../auth/type/jwt';
import {
  ChurchAdminGuard,
  ChurchMainAdminGuard,
} from './guard/church-admin.guard';
import { UpdateChurchDto } from './dto/update-church.dto';

@Controller('churches')
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Get()
  getAllChurches() {
    return this.churchesService.findAll();
  }

  @Get(':churchId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, ChurchAdminGuard)
  getChurchById(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.churchesService.findById(churchId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  postChurch(
    @AccessToken() accessToken: JwtAccessPayload,
    @Body() dto: CreateChurchDto,
  ) {
    return this.churchesService.createChurch(accessToken, dto);
  }

  @Patch(':churchId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, ChurchMainAdminGuard)
  patchChurch(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: UpdateChurchDto,
  ) {
    return this.churchesService.updateChurch(churchId, dto);
  }

  @Delete(':churchId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, ChurchMainAdminGuard)
  deleteChurch(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.churchesService.deleteChurchById(churchId);
  }
}
