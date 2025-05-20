import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { EducationSessionReportService } from '../service/education-session-report.service';

@Controller('education-session')
export class EducationSessionReportController {
  constructor(
    private readonly educationSessionReportService: EducationSessionReportService,
  ) {}

  @Get()
  getEducationSessionReport(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: any,
  ) {}

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
  patchEducationSessionReport() {}

  @Delete(':educationSessionReportId')
  deleteEducationSessionReport() {}
}
