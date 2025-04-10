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
import { ApiTags } from '@nestjs/swagger';
import { VisitationService } from '../visitation.service';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { CreateVisitationDto } from '../dto/create-visitation.dto';
import { ChurchManagerGuard } from '../../churches/guard/church-manager-guard.service';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { Token } from '../../auth/decorator/jwt.decorator';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { GetVisitationDto } from '../dto/get-visitation.dto';
import {
  ApiDeleteVisitation,
  ApiGetVisitationById,
  ApiGetVisitations,
  ApiPatchVisitationDetail,
  ApiPatchVisitationMeta,
  ApiPostVisitation,
} from '../decorator/visitation.swagger';
import { UpdateVisitationDto } from '../dto/update-visitation.dto';
import { VisitationPaginationResultDto } from '../dto/visitation-pagination-result.dto';
import { UpdateVisitationDetailDto } from '../dto/internal/detail/update-visitation-detail.dto';

@ApiTags('Visitations')
@Controller('visitations')
export class VisitationController {
  constructor(private readonly visitationService: VisitationService) {}

  @ApiGetVisitations()
  @Get()
  getVisitations(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetVisitationDto,
  ): Promise<VisitationPaginationResultDto> {
    return this.visitationService.getVisitations(churchId, dto);
  }

  @ApiPostVisitation()
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

  @ApiGetVisitationById()
  @Get(':visitationId')
  @UseInterceptors(TransactionInterceptor)
  getVisitingById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationMetaDataId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.getVisitationById(
      churchId,
      visitationMetaDataId,
      qr,
    );
  }

  @ApiPatchVisitationMeta()
  @Patch(':visitationId')
  @UseInterceptors(TransactionInterceptor)
  patchVisitationMetaData(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationMetaDataId: number,
    @Body() dto: UpdateVisitationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.updateVisitationData(
      churchId,
      visitationMetaDataId,
      dto,
      qr,
    );
  }

  @ApiDeleteVisitation()
  @Delete(':visitationId')
  @UseInterceptors(TransactionInterceptor)
  deleteVisiting(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.deleteVisitation(churchId, visitationId, qr);
  }

  @ApiPatchVisitationDetail()
  @Patch(':detailId')
  patchVisitationDetail(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @Param('detailId', ParseIntPipe) detailId: number,
    @Body() dto: UpdateVisitationDetailDto,
  ) {
    return this.visitationService.updateVisitationDetail(
      churchId,
      visitationId,
      detailId,
      dto,
    );
  }
}
