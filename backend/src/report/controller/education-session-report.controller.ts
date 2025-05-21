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
import { EducationSessionReportService } from '../service/education-session-report.service';
import { GetEducationSessionReportDto } from '../dto/education-report/session/request/get-education-session-report.dto';
import { UpdateEducationSessionReportDto } from '../dto/education-report/session/request/update-education-session-report.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Churches:Members:Reports:Education-Sessions')
@Controller('education-session')
export class EducationSessionReportController {
  constructor(
    private readonly educationSessionReportService: EducationSessionReportService,
  ) {}

  @Get()
  getEducationSessionReport(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetEducationSessionReportDto,
  ) {
    return this.educationSessionReportService.getEducationSessionReports(
      churchId,
      memberId,
      dto,
    );
  }

  @Get(':educationSessionReportId')
  getEducationSessionReportById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('educationSessionReportId', ParseIntPipe) reportId: number,
  ) {
    return this.educationSessionReportService.getEducationSessionReportById(
      churchId,
      memberId,
      reportId,
    );
  }

  @Patch(':educationSessionReportId')
  patchEducationSessionReport(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('educationSessionReportId', ParseIntPipe) reportId: number,
    @Body() dto: UpdateEducationSessionReportDto,
  ) {
    return this.educationSessionReportService.patchEducationSessionReport(
      churchId,
      memberId,
      reportId,
      dto,
    );
  }

  @Delete(':educationSessionReportId')
  deleteEducationSessionReport(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('educationSessionReportId', ParseIntPipe) reportId: number,
  ) {
    return this.educationSessionReportService.deleteEducationSessionReport(
      churchId,
      memberId,
      reportId,
    );
  }
}
