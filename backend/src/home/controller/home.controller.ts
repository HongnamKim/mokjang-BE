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
  ApiGetMyInChargedTasks,
  ApiGetMyInChargedVisitations,
  ApiGetNewMemberDetail,
  ApiGetNewMemberSummary,
} from '../swagger/home.swagger';
import { PermissionManager } from '../../permission/decorator/permission-manager.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { GetMyTasksDto } from '../dto/request/get-my-tasks.dto';
import { GetMyInChargedVisitationsDto } from '../dto/request/get-my-in-charged-visitations.dto';

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

  @ApiGetMyInChargedTasks()
  @Get('tasks')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMyInChargedTasks(
    @Query() dto: GetMyTasksDto,
    @PermissionManager() pm: ChurchUserModel,
  ) {
    if ((dto.from && !dto.to) || (!dto.from && dto.to)) {
      throw new BadRequestException('from, to 에러');
    }

    return this.homeService.getMyInChargedTasks(pm, dto);
  }

  @ApiGetMyInChargedVisitations()
  @Get('visitations')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMyInChargedVisitations(
    @Query() dto: GetMyInChargedVisitationsDto,
    @PermissionManager() pm: ChurchUserModel,
  ) {
    if ((dto.from && !dto.to) || (!dto.from && dto.to)) {
      throw new BadRequestException('from, to 에러');
    }

    return this.homeService.getMyInChargedVisitations(pm, dto);
  }
}
