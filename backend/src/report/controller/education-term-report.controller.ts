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
import { ChurchUserGuard } from '../../church-user/guard/church-user.guard';
import { RequestChurchUser } from '../../common/decorator/request-church-user.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

@ApiTags('MyPage:Reports:Education-Terms')
@Controller('education-term')
export class EducationTermReportController {
  constructor(
    private readonly educationTermReportService: EducationTermReportService,
  ) {}

  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Get()
  getEducationTermReport(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Query() dto: GetEducationTermReportsDto,
  ) {
    return this.educationTermReportService.getEducationTermReports(
      churchUser,
      dto,
    );
  }

  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Get(':educationTermReportId')
  getEducationTermReportById(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('educationTermReportId', ParseIntPipe) reportId: number,
  ) {
    return this.educationTermReportService.getEducationTermReportById(
      churchUser,
      reportId,
    );
  }

  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Patch(':educationTermReportId')
  patchEducationTermReport(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('educationTermReportId', ParseIntPipe) reportId: number,
    @Body() dto: UpdateEducationTermReportDto,
  ) {
    return this.educationTermReportService.patchEducationTermReport(
      churchUser,
      reportId,
      dto,
    );
  }

  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Delete(':educationTermReportId')
  deleteEducationTermReport(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('educationTermReportId', ParseIntPipe) reportId: number,
  ) {
    return this.educationTermReportService.deleteEducationTermReport(
      churchUser,
      reportId,
    );
  }
}
