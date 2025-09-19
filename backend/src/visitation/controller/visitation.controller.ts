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
import { RequestManager } from '../../permission/decorator/request-manager.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { RequestVisitation } from '../decorator/request-visitation.decorator';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';
import { GetVisitationResponseDto } from '../dto/response/get-visitation-response.dto';

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
    @RequestChurch() church: ChurchModel,
    @Body() dto: CreateVisitationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.createVisitation(manager, church, dto, qr);
  }

  @ApiRefreshVisitationCount()
  @Patch('refresh-count')
  @VisitationWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  refreshVisitationCount(
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.refreshVisitationCount(church, qr);
  }

  @ApiGetVisitationById()
  @VisitationReadGuard()
  @Get(':visitationId')
  getVisitingById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationMetaDataId: number,
    @RequestVisitation() requestVisitation: VisitationMetaModel,
  ) {
    return new GetVisitationResponseDto(requestVisitation);
  }

  @ApiPatchVisitationMeta()
  @VisitationWriteGuard()
  @Patch(':visitationId')
  @UseInterceptors(TransactionInterceptor)
  patchVisitationMetaData(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationMetaDataId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @RequestVisitation() requestVisitation: VisitationMetaModel,
    @Body() dto: UpdateVisitationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.updateVisitationData(
      church,
      requestManager,
      requestVisitation,
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
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @RequestVisitation() requestVisitation: VisitationMetaModel,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.deleteVisitation(
      church,
      requestManager,
      requestVisitation,
      qr,
    );
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
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Body() dto: AddReceiverDto,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.addReportReceivers(
      church,
      requestManager,
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
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Body() dto: DeleteReceiverDto,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.deleteReportReceivers(
      church,
      requestManager,
      visitationId,
      dto.receiverIds,
      qr,
    );
  }
}
