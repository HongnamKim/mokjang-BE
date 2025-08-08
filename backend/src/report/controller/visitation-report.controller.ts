import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
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
} from '../swagger/visitation-report.swagger';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchUserGuard } from '../../church-user/guard/church-user.guard';
import { RequestChurchUser } from '../../common/decorator/request-church-user.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

@ApiTags('MyPage:Reports:Visitations')
@Controller('visitations')
export class VisitationReportController {
  constructor(private readonly reportService: VisitationReportService) {}

  @ApiGetVisitationReports()
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Get()
  getVisitationReports(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Query() dto: GetVisitationReportDto,
  ) {
    return this.reportService.getVisitationReport(churchUser, dto);
  }

  @ApiGetVisitationReportById()
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Get(':visitationReportId')
  @UseInterceptors(TransactionInterceptor)
  getVisitationReportById(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('visitationReportId', ParseIntPipe) visitationReportId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.reportService.getVisitationReportById(
      churchUser,
      visitationReportId,
      qr,
    );
  }

  @ApiPatchVisitationReport()
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Patch(':visitationReportId')
  patchVisitationReport(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('visitationReportId', ParseIntPipe) visitationReportId: number,
    @Body() dto: UpdateVisitationReportDto,
  ) {
    return this.reportService.updateVisitationReport(
      churchUser,
      visitationReportId,
      dto,
    );
  }

  @ApiDeleteVisitationReport()
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Delete(':visitationReportId')
  deleteVisitationReport(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('visitationReportId', ParseIntPipe) visitationReportId: number,
  ) {
    return this.reportService.deleteVisitationReport(
      churchUser,
      visitationReportId,
    );
  }
}
