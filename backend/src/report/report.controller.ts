import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetVisitationReportDto } from './dto/visitation-report/get-visitation-report.dto';
import { ReportService } from './report.service';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateVisitationReportDto } from './dto/visitation-report/update-visitation-report.dto';

@ApiTags('Churches:Members:Reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('visitations')
  getVisitationReports(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetVisitationReportDto,
  ) {
    return this.reportService.getVisitationReport(churchId, memberId, dto);
  }

  @Get('visitations/:visitationReportId')
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

  @Patch('visitations/:visitationReportId')
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

  @Delete('visitations/:visitationReportId')
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
