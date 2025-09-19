import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { HomeService } from '../service/home.service';
import { GetNewMemberSummaryDto } from '../dto/request/get-new-member-summary.dto';
import { GetNewMemberDetailDto } from '../dto/request/get-new-member-detail.dto';
import {
  ApiGetLowWorshipAttendanceMembers,
  ApiGetMyInChargedSchedules,
  ApiGetMyScheduleReports,
  ApiGetNewMemberDetail,
  ApiGetNewMemberSummary,
  ApiGetScheduleStatus,
} from '../swagger/home.swagger';
import { RequestManager } from '../../permission/decorator/request-manager.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { GetMyInChargedSchedulesDto } from '../dto/request/get-my-in-charged-schedules.dto';
import { GetMyReportsDto } from '../dto/request/get-my-reports.dto';
import { GetLowWorshipAttendanceMembersDto } from '../dto/request/get-low-worship-attendance-members.dto';
import { GetScheduleStatusDto } from '../dto/request/get-schedule-status.dto';
import { HomeReadGuard } from '../guard/home-read.guard';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @ApiGetNewMemberSummary()
  @HomeReadGuard()
  @Get('members/new/summary')
  getNewMemberSummary(
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetNewMemberSummaryDto,
  ) {
    return this.homeService.getNewMemberSummary(church, dto);
  }

  @ApiGetNewMemberDetail()
  @HomeReadGuard()
  @Get('members/new/details')
  getNewMemberDetails(
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetNewMemberDetailDto,
  ) {
    return this.homeService.getNewMemberDetails(church, dto);
  }

  @ApiGetMyInChargedSchedules()
  @Get('schedules')
  @HomeReadGuard()
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
  @HomeReadGuard()
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
  @HomeReadGuard()
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
  @HomeReadGuard()
  getLowWorshipAttendanceMembers(
    @RequestChurch() church: ChurchModel,
    @RequestManager() pm: ChurchUserModel,
    @Query() dto: GetLowWorshipAttendanceMembersDto,
  ) {
    return this.homeService.getLowWorshipAttendanceMembers(church, pm, dto);
  }
}
