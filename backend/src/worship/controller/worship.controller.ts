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

@ApiTags('Worships')
@Controller()
export class WorshipController {
  constructor(private readonly worshipService: WorshipService) {}

  @Get()
  getWorships(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetWorshipsDto,
  ) {
    return this.worshipService.findWorships(churchId, dto);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  postWorship(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateWorshipDto,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipService.postWorship(churchId, dto, qr);
  }

  @Get(':worshipId')
  getWorshipById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
  ) {
    return this.worshipService.findWorshipById(churchId, worshipId);
  }

  @Patch(':worshipId')
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
  @UseInterceptors(TransactionInterceptor)
  DeleteWorshipById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipService.deleteWorshipById(churchId, worshipId, qr);
  }
}
