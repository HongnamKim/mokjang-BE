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
} from '../swagger/education-session-report.swagger';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { Token } from '../../auth/decorator/jwt.decorator';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { ChurchUserGuard } from '../../church-user/guard/church-user.guard';
import { RequestChurchUser } from '../../common/decorator/request-church-user.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

@ApiTags('MyPage:Reports:Education-Sessions')
@Controller('education-session')
export class EducationSessionReportController {
  constructor(
    private readonly educationSessionReportService: EducationSessionReportService,
  ) {}

  @ApiGetEducationSessionReports()
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Get()
  getEducationSessionReport(
    @RequestChurchUser() user: ChurchUserModel,
    @Query() dto: GetEducationSessionReportDto,
  ) {
    return this.educationSessionReportService.getEducationSessionReports(
      user,
      dto,
    );
  }

  @ApiGetEducationSessionReportById()
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Get(':educationSessionReportId')
  getEducationSessionReportById(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('educationSessionReportId', ParseIntPipe) reportId: number,
  ) {
    return this.educationSessionReportService.getEducationSessionReportById(
      churchUser,
      reportId,
    );
  }

  @ApiPatchEducationSessionReport()
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Patch(':educationSessionReportId')
  patchEducationSessionReport(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('educationSessionReportId', ParseIntPipe) reportId: number,
    @Body() dto: UpdateEducationSessionReportDto,
  ) {
    return this.educationSessionReportService.patchEducationSessionReport(
      churchUser,
      reportId,
      dto,
    );
  }

  @ApiDeleteEducationSessionReport()
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Delete(':educationSessionReportId')
  deleteEducationSessionReport(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('educationSessionReportId', ParseIntPipe) reportId: number,
  ) {
    return this.educationSessionReportService.deleteEducationSessionReport(
      churchUser,
      reportId,
    );
  }
}
