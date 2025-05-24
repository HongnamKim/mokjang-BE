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
import { ApiTags } from '@nestjs/swagger';
import { GetVisitationReportDto } from '../dto/visitation-report/get-visitation-report.dto';
import { VisitationReportService } from '../service/visitation-report.service';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateVisitationReportDto } from '../dto/visitation-report/update-visitation-report.dto';
import {
  ApiDeleteVisitationReport,
  ApiGetVisitationReportById,
  ApiGetVisitationReports,
  ApiPatchVisitationReport,
} from '../const/swagger/visitation-report.swagger';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';

@ApiTags('Churches:Members:Reports:Visitations')
@Controller('visitations')
export class VisitationReportController {
  constructor(private readonly reportService: VisitationReportService) {}

  @ApiGetVisitationReports()
  @Get()
  getVisitationReports(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetVisitationReportDto,
  ) {
    return this.reportService.getVisitationReport(churchId, memberId, dto);
  }

  @ApiGetVisitationReportById()
  @Get(':visitationReportId')
  @UseInterceptors(TransactionInterceptor)
  getVisitationReportById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('visitationReportId', ParseIntPipe) visitationReportId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.reportService.getVisitationReportById(
      churchId,
      memberId,
      visitationReportId,
      qr,
    );
  }

  @ApiPatchVisitationReport()
  @Patch(':visitationReportId')
  patchVisitationReport(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('visitationReportId', ParseIntPipe) visitationReportId: number,
    @Body() dto: UpdateVisitationReportDto,
  ) {
    return this.reportService.updateVisitationReport(
      churchId,
      memberId,
      visitationReportId,
      dto,
    );
  }

  @ApiDeleteVisitationReport()
  @Delete(':visitationReportId')
  deleteVisitationReport(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('visitationReportId', ParseIntPipe) visitationReportId: number,
  ) {
    return this.reportService.deleteVisitationReport(
      churchId,
      memberId,
      visitationReportId,
    );
  }
}
