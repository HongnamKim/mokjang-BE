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
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { EducationTermReportService } from '../service/education-term-report.service';
import { Token } from '../../auth/decorator/jwt.decorator';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { GetEducationTermReportsDto } from '../dto/education-report/term/request/get-education-term-reports.dto';
import { UpdateEducationTermReportDto } from '../dto/education-report/term/request/update-education-term-report.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('MyPage:Reports:Education-Terms')
@Controller('education-term')
export class EducationTermReportController {
  constructor(
    private readonly educationTermReportService: EducationTermReportService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Get()
  getEducationTermReport(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Query() dto: GetEducationTermReportsDto,
  ) {
    return this.educationTermReportService.getEducationTermReports(
      accessToken.id,
      dto,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Get(':educationTermReportId')
  getEducationTermReportById(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Param('educationTermReportId', ParseIntPipe) reportId: number,
  ) {
    return this.educationTermReportService.getEducationTermReportById(
      accessToken.id,
      reportId,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':educationTermReportId')
  patchEducationTermReport(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Param('educationTermReportId', ParseIntPipe) reportId: number,
    @Body() dto: UpdateEducationTermReportDto,
  ) {
    return this.educationTermReportService.patchEducationTermReport(
      accessToken.id,
      reportId,
      dto,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':educationTermReportId')
  deleteEducationTermReport(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Param('educationTermReportId', ParseIntPipe) reportId: number,
  ) {
    return this.educationTermReportService.deleteEducationTermReport(
      accessToken.id,
      reportId,
    );
  }
}
