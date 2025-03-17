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
import { ApiTags } from '@nestjs/swagger';
import { MinistryService } from '../service/ministry.service';
import { CreateMinistryDto } from '../dto/create-ministry.dto';
import { UpdateMinistryDto } from '../dto/update-ministry.dto';
import { GetMinistryDto } from '../dto/get-ministry.dto';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';

@ApiTags('Management:Ministries')
@Controller('ministries')
export class MinistriesController {
  constructor(private readonly ministryService: MinistryService) {}

  @Get()
  getMinistries(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetMinistryDto,
  ) {
    return this.ministryService.getMinistries(churchId, dto);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  postMinistries(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateMinistryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryService.createMinistry(churchId, dto, qr);
  }

  @Get(':ministryId')
  getMinistryById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
  ) {
    return this.ministryService.getMinistryById(churchId, ministryId);
  }

  @Patch(':ministryId')
  @UseInterceptors(TransactionInterceptor)
  patchMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
    @Body() dto: UpdateMinistryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryService.updateMinistry(churchId, ministryId, dto, qr);
  }

  @Delete(':ministryId')
  @UseInterceptors(TransactionInterceptor)
  deleteMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryService.deleteMinistry(churchId, ministryId, qr);
  }
}
