import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { RequestChurch } from '../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { HomeService } from '../service/home.service';
import { GetNewMemberSummaryDto } from '../dto/request/get-new-member-summary.dto';
import { GetNewMemberDetailDto } from '../dto/request/get-new-member-detail.dto';
import {
  ApiGetLowWorshipAttendanceMembers,
  ApiGetMyInChargedSchedules,
  ApiGetScheduleStatus,
  ApiGetMyScheduleReports,
  ApiGetNewMemberDetail,
  ApiGetNewMemberSummary,
} from '../swagger/home.swagger';
import { RequestManager } from '../../permission/decorator/permission-manager.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { GetMyInChargedSchedulesDto } from '../dto/request/get-my-in-charged-schedules.dto';
import { GetMyReportsDto } from '../dto/request/get-my-reports.dto';
import { GetLowWorshipAttendanceMembersDto } from '../dto/request/get-low-worship-attendance-members.dto';
import { GetScheduleStatusDto } from '../dto/request/get-schedule-status.dto';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @ApiGetNewMemberSummary()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @Get('members/new/summary')
  getNewMemberSummary(
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetNewMemberSummaryDto,
  ) {
    return this.homeService.getNewMemberSummary(church, dto);
  }

  @ApiGetNewMemberDetail()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @Get('members/new/details')
  getNewMemberDetails(
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetNewMemberDetailDto,
  ) {
    return this.homeService.getNewMemberDetails(church, dto);
  }

  @ApiGetMyInChargedSchedules()
  @Get('schedules')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMyInChargedSchedules(
    @Query() dto: GetMyInChargedSchedulesDto,
    @RequestManager() pm: ChurchUserModel,
  ) {
    if ((dto.from && !dto.to) || (!dto.from && dto.to)) {
      throw new BadRequestException('from, to 에러');
    }

    return this.homeService.getMyInChargedSchedules(pm, dto);
  }

  @ApiGetScheduleStatus()
  @Get('schedules/status')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getScheduleStatus(
    @Query() dto: GetScheduleStatusDto,
    @RequestChurch() requestChurch: ChurchModel,
    @RequestManager() requestMember: ChurchUserModel,
  ) {
    if ((dto.from && !dto.to) || (!dto.from && dto.to)) {
      throw new BadRequestException('from, to 에러');
    }

    return this.homeService.getMyInChargeScheduleStatus(
      requestChurch,
      requestMember,
      dto,
    );
  }

  @ApiGetMyScheduleReports()
  @Get('reports')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMyScheduleReports(
    @RequestManager() pm: ChurchUserModel,
    @Query() dto: GetMyReportsDto,
  ) {
    if ((dto.from && !dto.to) || (!dto.from && dto.to)) {
      throw new BadRequestException('from, to 에러');
    }

    return this.homeService.getMyReports(pm, dto);
  }

  @ApiGetLowWorshipAttendanceMembers()
  @Get('worship-attendances')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getLowWorshipAttendanceMembers(
    @RequestChurch() church: ChurchModel,
    @RequestManager() pm: ChurchUserModel,
    @Query() dto: GetLowWorshipAttendanceMembersDto,
  ) {
    return this.homeService.getLowWorshipAttendanceMembers(church, pm, dto);
  }
}
