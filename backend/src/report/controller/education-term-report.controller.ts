import { Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';

@Controller('education-term')
export class EducationTermReportController {
  constructor() {}

  @UseGuards(AccessTokenGuard)
  @Get()
  getEducationTermReport() {}

  @UseGuards(AccessTokenGuard)
  @Get(':educationTermReportId')
  getEducationTermReportById() {}

  @UseGuards(AccessTokenGuard)
  @Patch(':educationTermReportId')
  patchEducationTermReport() {}

  @UseGuards(AccessTokenGuard)
  @Delete(':educationTermReportId')
  deleteEducationTermReport() {}
}
