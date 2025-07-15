import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { PermissionChurch } from '../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { HomeService } from '../service/home.service';
import { GetNewMemberSummaryDto } from '../dto/request/get-new-member-summary.dto';
import { GetNewMemberDetailDto } from '../dto/request/get-new-member-detail.dto';
import {
  ApiGetMyInChargedSchedules,
  ApiGetNewMemberDetail,
  ApiGetNewMemberSummary,
} from '../swagger/home.swagger';
import { PermissionManager } from '../../permission/decorator/permission-manager.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { GetMyInChargedSchedulesDto } from '../dto/request/get-my-in-charged-schedules.dto';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @ApiGetNewMemberSummary()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @Get('members/new/summary')
  getNewMemberSummary(
    @PermissionChurch() church: ChurchModel,
    @Query() dto: GetNewMemberSummaryDto,
  ) {
    return this.homeService.getNewMemberSummary(church, dto);
  }

  @ApiGetNewMemberDetail()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @Get('members/new/details')
  getNewMemberDetails(
    @PermissionChurch() church: ChurchModel,
    @Query() dto: GetNewMemberDetailDto,
  ) {
    return this.homeService.getNewMemberDetails(church, dto);
  }

  @ApiGetMyInChargedSchedules()
  @Get('schedules')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMyInChargedSchedules(
    @Query() dto: GetMyInChargedSchedulesDto,
    @PermissionManager() pm: ChurchUserModel,
  ) {
    if ((dto.from && !dto.to) || (!dto.from && dto.to)) {
      throw new BadRequestException('from, to 에러');
    }

    return this.homeService.getMyInChargedSchedules(pm, dto);
  }

  /*@ApiGetMyInChargedTasks()
  @Get('schedules/tasks')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMyInChargedTasks(
    @Query() dto: GetMyInChargedSchedulesDto,
    @PermissionManager() pm: ChurchUserModel,
  ) {
    if ((dto.from && !dto.to) || (!dto.from && dto.to)) {
      throw new BadRequestException('from, to 에러');
    }

    return this.homeService.getMyInChargedTasks(pm, dto);
  }*/

  /*@ApiGetMyInChargedVisitations()
  @Get('schedules/visitations')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMyInChargedVisitations(
    @Query() dto: GetMyInChargedSchedulesDto,
    @PermissionManager() pm: ChurchUserModel,
  ) {
    if ((dto.from && !dto.to) || (!dto.from && dto.to)) {
      throw new BadRequestException('from, to 에러');
    }

    return this.homeService.getMyInChargedVisitations(pm, dto);
  }*/

  /*@ApiGetMyInChargedEducations()
  @Get('schedules/educations')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMyInChargedEducations(
    @PermissionManager() pm: ChurchUserModel,
    @Query() dto: GetMyInChargedSchedulesDto,
  ) {
    if ((dto.from && !dto.to) || (!dto.from && dto.to)) {
      throw new BadRequestException('from, to 에러');
    }

    return this.homeService.getMyInChargedEducations(pm, dto);
  }*/
}
