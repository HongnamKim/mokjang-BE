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
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VisitationService } from './visitation.service';
import { UpdateVisitationMetaDto } from './dto/meta/update-visitation-meta.dto';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { CreateVisitationDto } from './dto/create-visitation.dto';
import { ChurchManagerGuard } from '../churches/guard/church-manager-guard.service';
import { AccessTokenGuard } from '../auth/guard/jwt.guard';
import { Token } from '../auth/decorator/jwt.decorator';
import { AuthType } from '../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../auth/type/jwt';

@ApiTags('Visitations')
@Controller('visitations')
export class VisitationController {
  constructor(private readonly visitationService: VisitationService) {}

  @Get()
  getVisitations(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.visitationService.getVisitations(churchId);
  }

  @Post()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @UseInterceptors(TransactionInterceptor)
  postVisitationReservation(
    @Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @Param('churchId', ParseIntPipe)
    churchId: number,
    @Body() dto: CreateVisitationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.createVisitation(
      accessPayload,
      churchId,
      dto,
      qr,
    );
  }

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
