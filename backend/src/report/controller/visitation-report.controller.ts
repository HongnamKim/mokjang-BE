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
} from '../const/swagger/visitation-report.swagger';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { Token } from '../../auth/decorator/jwt.decorator';
import { JwtAccessPayload } from '../../auth/type/jwt';

@ApiTags('MyPage:Reports:Visitations')
@Controller('visitations')
export class VisitationReportController {
  constructor(private readonly reportService: VisitationReportService) {}

  @ApiGetVisitationReports()
  @UseGuards(AccessTokenGuard)
  @Get()
  getVisitationReports(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Query() dto: GetVisitationReportDto,
  ) {
    return this.reportService.getVisitationReport(accessToken.id, dto);
  }

  @ApiGetVisitationReportById()
  @UseGuards(AccessTokenGuard)
  @Get(':visitationReportId')
  @UseInterceptors(TransactionInterceptor)
  getVisitationReportById(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Param('visitationReportId', ParseIntPipe) visitationReportId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.reportService.getVisitationReportById(
      accessToken.id,
      visitationReportId,
      qr,
    );
  }

  @ApiPatchVisitationReport()
  @UseGuards(AccessTokenGuard)
  @Patch(':visitationReportId')
  patchVisitationReport(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Param('visitationReportId', ParseIntPipe) visitationReportId: number,
    @Body() dto: UpdateVisitationReportDto,
  ) {
    return this.reportService.updateVisitationReport(
      accessToken.id,
      visitationReportId,
      dto,
    );
  }

  @ApiDeleteVisitationReport()
  @UseGuards(AccessTokenGuard)
  @Delete(':visitationReportId')
  deleteVisitationReport(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Param('visitationReportId', ParseIntPipe) visitationReportId: number,
  ) {
    return this.reportService.deleteVisitationReport(
      accessToken.id,
      visitationReportId,
    );
  }
}
