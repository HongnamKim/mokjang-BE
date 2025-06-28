import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorshipService } from '../service/worship.service';
import { GetWorshipsDto } from '../dto/request/worship/get-worships.dto';
import { CreateWorshipDto } from '../dto/request/worship/create-worship.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateWorshipDto } from '../dto/request/worship/update-worship.dto';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { PermissionChurch } from '../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { WorshipWriteGuard } from '../guard/worship-write.guard';
import { WorshipReadGuard } from '../guard/worship-read.guard';

@ApiTags('Worships')
@Controller()
export class WorshipController {
  constructor(private readonly worshipService: WorshipService) {}

  @Get()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getWorships(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetWorshipsDto,
    @PermissionChurch() church: ChurchModel,
  ) {
    return this.worshipService.findWorships(church, dto);
  }

  @Post()
  @WorshipWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postWorship(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateWorshipDto,
    @QueryRunner() qr: QR,
    @PermissionChurch() church: ChurchModel,
  ) {
    return this.worshipService.postWorship(church, dto, qr);
  }

  @Get(':worshipId')
  @WorshipReadGuard()
  getWorshipById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
  ) {
    return this.worshipService.findWorshipById(churchId, worshipId);
  }

  @Patch(':worshipId')
  @WorshipWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchWorshipById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Body() dto: UpdateWorshipDto,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipService.patchWorshipById(churchId, worshipId, dto, qr);
  }

  @ApiOperation({
    summary: '예배 삭제',
    description: '하위 enrollment, session, attendance 삭제',
  })
  @Delete(':worshipId')
  @WorshipWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  DeleteWorshipById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipService.deleteWorshipById(churchId, worshipId, qr);
  }
}
