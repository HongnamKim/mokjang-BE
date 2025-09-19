import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MembersService } from '../service/members.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMemberDto } from '../dto/request/create-member.dto';
import { QueryRunner as QR } from 'typeorm';
import { UpdateMemberDto } from '../dto/request/update-member.dto';
import { GetMemberDto } from '../dto/request/get-member.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { GetSimpleMembersDto } from '../dto/request/get-simple-members.dto';
import { MemberReadGuard } from '../guard/member-read.guard';
import { MemberWriteGuard } from '../guard/member-write.guard';
import { RequestManager } from '../../permission/decorator/request-manager.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { TargetMember } from '../decorator/target-member.decorator';
import { MemberModel } from '../entity/member.entity';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { GetMemberListDto } from '../dto/list/get-member-list.dto';
import { MemberDisplayColumn } from '../const/enum/list/display-column.enum';
import { GetSimpleMemberListDto } from '../dto/list/get-simple-member-list.dto';
import { GetMemberWorshipStatisticsDto } from '../dto/request/worship/get-member-worship-statistics.dto';
import { endOfToday, startOfToday, subYears } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { GetMemberWorshipAttendancesDto } from '../dto/request/worship/get-member-worship-attendances.dto';

@ApiTags('Churches:Members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetMemberDto,
    @RequestManager() pm: ChurchUserModel,
  ) {
    return this.membersService.getMembers(church, pm, dto);
  }

  @Post()
  @MemberWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: CreateMemberDto,
    @QueryRunner() qr: QR,
  ) {
    return this.membersService.createMember(church, dto, qr);
  }

  @Get('v2')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMemberList(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Query() query: GetMemberListDto,
  ) {
    if (query.displayColumns.length === 0) {
      query.displayColumns = [
        MemberDisplayColumn.OFFICER,
        MemberDisplayColumn.BIRTH,
        MemberDisplayColumn.GROUP,
        MemberDisplayColumn.MOBILE_PHONE,
        MemberDisplayColumn.ADDRESS,
      ];
    }

    return this.membersService.getMemberList(church, requestManager, query);
  }

  @Get('simple')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMembersSimple(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetSimpleMembersDto,
  ) {
    return this.membersService.getSimpleMembers(church, dto);
  }

  @Get('simple/v2')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getSimpleMemberList(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() query: GetSimpleMemberListDto,
  ) {
    return this.membersService.getSimpleMemberList(church, query);
  }

  @Get(':memberId')
  @MemberReadGuard()
  getMemberById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() pm: ChurchUserModel,
  ) {
    return this.membersService.getMemberById(church, memberId, pm);
  }

  @Patch(':memberId')
  @MemberWriteGuard()
  patchMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateMemberDto,
    @RequestChurch() church: ChurchModel,
    @TargetMember() targetMember: MemberModel,
  ) {
    return this.membersService.updateMember(church, targetMember, dto);
  }

  @Delete(':memberId')
  @MemberWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  deleteMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @RequestChurch() church: ChurchModel,
    @TargetMember() targetMember: MemberModel,
    @QueryRunner() qr: QR,
  ) {
    return this.membersService.softDeleteMember(church, targetMember, qr);
  }

  @ApiOperation({ summary: '대상 예배 조회' })
  @Get(':memberId/worship/available')
  @MemberReadGuard()
  getMemberAvailableWorship(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @RequestChurch() church: ChurchModel,
  ) {
    return this.membersService.getAvailableWorship(church, memberId);
  }

  @ApiOperation({ summary: '예배 출석률 조회' })
  @Get(':memberId/worship/statistics')
  @MemberReadGuard()
  getMemberWorshipStatistics(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetMemberWorshipStatisticsDto,
  ) {
    dto.utcFrom = dto.from
      ? fromZonedTime(dto.from, TIME_ZONE.SEOUL)
      : fromZonedTime(subYears(startOfToday(), 1), TIME_ZONE.SEOUL);
    dto.utcTo = dto.to
      ? fromZonedTime(dto.to, TIME_ZONE.SEOUL)
      : fromZonedTime(endOfToday(), TIME_ZONE.SEOUL);

    return this.membersService.getMemberWorshipStatistics(
      church,
      memberId,
      dto,
    );
  }

  @Get(':memberId/worship/attendances')
  @MemberReadGuard()
  getMemberWorshipRecentAttendance(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetMemberWorshipAttendancesDto,
  ) {
    dto.utcFrom = dto.from
      ? fromZonedTime(dto.from, TIME_ZONE.SEOUL)
      : fromZonedTime(subYears(startOfToday(), 1), TIME_ZONE.SEOUL);
    dto.utcTo = dto.to
      ? fromZonedTime(dto.to, TIME_ZONE.SEOUL)
      : fromZonedTime(endOfToday(), TIME_ZONE.SEOUL);

    return this.membersService.getMemberWorshipAttendances(
      church,
      memberId,
      dto,
    );
  }
}
