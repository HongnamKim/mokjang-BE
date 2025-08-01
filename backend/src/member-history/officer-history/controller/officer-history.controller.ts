import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { OfficerHistoryService } from '../service/officer-history.service';
import { QueryRunner as QR } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import { GetOfficerHistoryDto } from '../dto/request/get-officer-history.dto';
import { UpdateOfficerHistoryDto } from '../dto/request/update-officer-history.dto';
import {
  ApiDeleteOfficerHistory,
  ApiGetMemberOfficerHistory,
  ApiPatchOfficerHistory,
} from '../swagger/officer-history.swagger';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { HistoryReadGuard } from '../../guard/history-read.guard';
import { HistoryWriteGuard } from '../../guard/history-write.guard';

@ApiTags('Churches:Members:Officer')
@Controller('officers')
export class OfficerHistoryController {
  constructor(private readonly officerHistoryService: OfficerHistoryService) {}

  @ApiGetMemberOfficerHistory()
  @Get()
  @HistoryReadGuard()
  getMemberOfficerHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetOfficerHistoryDto,
  ) {
    return this.officerHistoryService.getMemberOfficerHistory(
      churchId,
      memberId,
      dto,
    );
  }

  @ApiPatchOfficerHistory()
  @Patch(':officerHistoryId')
  @HistoryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchOfficerHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('officerHistoryId', ParseIntPipe) officerHistoryId: number,
    @Body() dto: UpdateOfficerHistoryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.officerHistoryService.updateOfficerHistory(
      churchId,
      memberId,
      officerHistoryId,
      dto,
      qr,
    );
  }

  @ApiDeleteOfficerHistory()
  @Delete(':officerHistoryId')
  @HistoryWriteGuard()
  deleteOfficerHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('officerHistoryId', ParseIntPipe) officerHistoryId: number,
  ) {
    return this.officerHistoryService.deleteOfficerHistory(
      churchId,
      memberId,
      officerHistoryId,
    );
  }

  /*@ApiPostMemberOfficer()
  @Post()
  @HistoryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postMemberOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: SetMemberOfficerDto,
    @QueryRunner() qr: QR,
  ) {
    return this.officerHistoryService.setMemberOfficer(
      churchId,
      memberId,
      dto,
      qr,
    );
  }

  @ApiEndMemberOfficer()
  //@Delete()
  @Patch('end')
  @HistoryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  endMemberOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: EndMemberOfficeDto,
    @QueryRunner() qr: QR,
  ) {
    return this.officerHistoryService.endMemberOfficer(
      churchId,
      memberId,
      dto,
      qr,
    );
  }*/
}
