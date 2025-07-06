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
} from '@nestjs/common';
import { EducationSessionReportService } from '../service/education-session-report.service';
import { GetEducationSessionReportDto } from '../dto/education-report/session/request/get-education-session-report.dto';
import { UpdateEducationSessionReportDto } from '../dto/education-report/session/request/update-education-session-report.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiDeleteEducationSessionReport,
  ApiGetEducationSessionReportById,
  ApiGetEducationSessionReports,
  ApiPatchEducationSessionReport,
} from '../const/swagger/education-session-report.swagger';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { Token } from '../../auth/decorator/jwt.decorator';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../../auth/type/jwt';

@ApiTags('Me:Reports:Education-Sessions')
@Controller('education-session')
export class EducationSessionReportController {
  constructor(
    private readonly educationSessionReportService: EducationSessionReportService,
  ) {}

  @ApiGetEducationSessionReports()
  @UseGuards(AccessTokenGuard)
  @Get()
  getEducationSessionReport(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Query() dto: GetEducationSessionReportDto,
  ) {
    return this.educationSessionReportService.getEducationSessionReports(
      accessToken.id,
      dto,
    );
  }

  @ApiGetEducationSessionReportById()
  @UseGuards(AccessTokenGuard)
  @Get(':educationSessionReportId')
  getEducationSessionReportById(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Param('educationSessionReportId', ParseIntPipe) reportId: number,
  ) {
    return this.educationSessionReportService.getEducationSessionReportById(
      accessToken.id,
      reportId,
    );
  }

  @ApiPatchEducationSessionReport()
  @UseGuards(AccessTokenGuard)
  @Patch(':educationSessionReportId')
  patchEducationSessionReport(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Param('educationSessionReportId', ParseIntPipe) reportId: number,
    @Body() dto: UpdateEducationSessionReportDto,
  ) {
    return this.educationSessionReportService.patchEducationSessionReport(
      accessToken.id,
      reportId,
      dto,
    );
  }

  @ApiDeleteEducationSessionReport()
  @UseGuards(AccessTokenGuard)
  @Delete(':educationSessionReportId')
  deleteEducationSessionReport(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Param('educationSessionReportId', ParseIntPipe) reportId: number,
  ) {
    return this.educationSessionReportService.deleteEducationSessionReport(
      accessToken.id,
      reportId,
    );
  }
}
