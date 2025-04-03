import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VisitationService } from './visitation.service';
import { CreateVisitationMetaDto } from './dto/meta/create-visitation-meta.dto';
import { UpdateVisitationMetaDto } from './dto/meta/update-visitation-meta.dto';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@ApiTags('Visitations')
@Controller('visitations')
export class VisitationController {
  constructor(private readonly visitationService: VisitationService) {}

  @Get()
  getVisitations(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.visitationService.getVisitations(churchId);
  }

  @Post('meta')
  postVisitationMetaData(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateVisitationMetaDto,
  ) {
    return this.visitationService.createVisitingMetaData(churchId, dto);
  }

  @Post(':metaId/details')
  postVisitationDetail(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('metaId', ParseIntPipe) metaId: number,
  ) {}

  @Patch(':metaId/details/:detailId')
  patchVisitationDetail() {}

  @Get(':visitingId')
  @UseInterceptors(TransactionInterceptor)
  getVisitingById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitingId', ParseIntPipe) visitingMetaDataId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.getVisitationById(
      churchId,
      visitingMetaDataId,
      qr,
    );
  }

  @Patch(':visitationId')
  patchVisitationMetaData(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationMetaDataId: number,
    @Body() dto: UpdateVisitationMetaDto,
  ) {
    return this.visitationService.updateVisitingMetaData(
      churchId,
      visitationMetaDataId,
      dto,
    );
  }

  @Delete(':visitingId')
  deleteVisiting(@Param('visitingId', ParseIntPipe) visitingId) {}
}
