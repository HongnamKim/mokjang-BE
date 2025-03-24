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
import { Token } from '../auth/decorator/jwt.decorator';
import { JwtAccessPayload } from '../auth/type/jwt';
import {
  ChurchManagerGuard,
  ChurchMainAdminGuard,
} from './guard/church-manager-guard.service';
import { UpdateChurchDto } from './dto/update-church.dto';
import {
  ApiDeleteChurch,
  ApiGetAllChurches,
  ApiGetChurchById,
  ApiPatchChurch,
  ApiPostChurch,
} from './const/swagger/churches/controller.swagger';
import { AuthType } from '../auth/const/enum/auth-type.enum';

@Controller('churches')
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @ApiGetAllChurches()
  @Get()
  getAllChurches() {
    return this.churchesService.findAllChurches();
  }

  @ApiPostChurch()
  @Post()
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  postChurch(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Body() dto: CreateChurchDto,
  ) {
    return this.churchesService.createChurch(accessToken, dto);
  }

  @ApiGetChurchById()
  @Get(':churchId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getChurchById(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.churchesService.getChurchById(churchId);
  }

  @ApiPatchChurch()
  @Patch(':churchId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, ChurchMainAdminGuard)
  patchChurch(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: UpdateChurchDto,
  ) {
    return this.churchesService.updateChurch(churchId, dto);
  }

  @ApiDeleteChurch()
  @Delete(':churchId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, ChurchMainAdminGuard)
  deleteChurch(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.churchesService.deleteChurchById(churchId);
  }
}
