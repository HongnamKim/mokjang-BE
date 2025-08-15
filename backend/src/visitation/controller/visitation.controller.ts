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
import { VisitationService } from '../service/visitation.service';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { CreateVisitationDto } from '../dto/request/create-visitation.dto';
import { GetVisitationDto } from '../dto/request/get-visitation.dto';
import {
  ApiDeleteVisitation,
  ApiGetVisitationById,
  ApiGetVisitations,
  ApiPatchVisitationMeta,
  ApiPostVisitation,
  ApiRefreshVisitationCount,
} from '../const/swagger/visitation.swagger';
import { UpdateVisitationDto } from '../dto/request/update-visitation.dto';
import { AddReceiverDto } from '../dto/receiever/add-receiver.dto';
import { DeleteReceiverDto } from '../dto/receiever/delete-receiver.dto';
import { VisitationReadGuard } from '../guard/visitation-read.guard';
import { VisitationWriteGuard } from '../guard/visitation-write.guard';
import { RequestManager } from '../../permission/decorator/permission-manager.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { RequestChurch } from '../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';

@ApiTags('Visitations')
@Controller('visitations')
export class VisitationController {
  constructor(private readonly visitationService: VisitationService) {}

  @ApiGetVisitations()
  @VisitationReadGuard()
  @Get()
  getVisitations(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetVisitationDto,
  ) {
    return this.visitationService.getVisitations(churchId, dto);
  }

  @ApiPostVisitation()
  @VisitationWriteGuard()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postVisitationReservation(
    @RequestManager() manager: ChurchUserModel,
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateVisitationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.createVisitation(manager, churchId, dto, qr);
  }

  @ApiRefreshVisitationCount()
  @Patch('refresh-count')
  @VisitationWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  refreshVisitationCount(
    //@Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.refreshVisitationCount(church, qr);
  }

  @ApiGetVisitationById()
  @VisitationReadGuard()
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
  @VisitationWriteGuard()
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
  @VisitationWriteGuard()
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
  @VisitationWriteGuard()
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
  @VisitationWriteGuard()
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
