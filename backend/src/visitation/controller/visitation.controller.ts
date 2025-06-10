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
import { VisitationService } from '../service/visitation.service';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { CreateVisitationDto } from '../dto/request/create-visitation.dto';
import { ChurchManagerGuard } from '../../churches/guard/church-guard.service';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { Token } from '../../auth/decorator/jwt.decorator';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { GetVisitationDto } from '../dto/request/get-visitation.dto';
import {
  ApiDeleteVisitation,
  ApiGetVisitationById,
  ApiGetVisitations,
  ApiPatchVisitationMeta,
  ApiPostVisitation,
} from '../const/swagger/visitation.swagger';
import { UpdateVisitationDto } from '../dto/request/update-visitation.dto';
import { AddReceiverDto } from '../dto/receiever/add-receiver.dto';
import { DeleteReceiverDto } from '../dto/receiever/delete-receiver.dto';
import { createDomainGuard } from '../../permission/guard/generic-domain.guard';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainAction } from '../../permission/const/domain-action.enum';

@ApiTags('Visitations')
@Controller('visitations')
export class VisitationController {
  constructor(private readonly visitationService: VisitationService) {}

  @ApiGetVisitations()
  @UseGuards(
    AccessTokenGuard,
    createDomainGuard(DomainType.VISITATION, '심방', DomainAction.READ),
  )
  @Get()
  getVisitations(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetVisitationDto,
  ) {
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
      accessPayload.id,
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

  @ApiOperation({
    summary: '심방 보고자 추가',
  })
  @Patch(':visitationId/add-receivers')
  @UseInterceptors(TransactionInterceptor)
  addReportReceivers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @Body() dto: AddReceiverDto,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.addReportReceivers(
      churchId,
      visitationId,
      dto.receiverIds,
      qr,
    );
  }

  @ApiOperation({
    summary: '심방 보고자 삭제',
  })
  @Patch(':visitationId/delete-receivers')
  @UseInterceptors(TransactionInterceptor)
  removeReportReceivers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @Body() dto: DeleteReceiverDto,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.deleteReportReceivers(
      churchId,
      visitationId,
      dto.receiverIds,
      qr,
    );
  }
}
