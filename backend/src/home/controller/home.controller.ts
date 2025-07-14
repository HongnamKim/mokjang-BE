import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { PermissionChurch } from '../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { HomeService } from '../service/home.service';
import { GetNewMemberSummaryDto } from '../dto/request/get-new-member-summary.dto';
import { GetNewMemberDetailDto } from '../dto/request/get-new-member-detail.dto';
import {
  ApiGetNewMemberDetail,
  ApiGetNewMemberSummary,
} from '../swagger/home.swagger';

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
}
