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
import { ApiTags } from '@nestjs/swagger';
import { CreateMemberDto } from '../dto/request/create-member.dto';
import { QueryRunner as QR } from 'typeorm';
import { UpdateMemberDto } from '../dto/request/update-member.dto';
import { GetMemberDto } from '../dto/request/get-member.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { GetSimpleMembersDto } from '../dto/request/get-simple-members.dto';
import { MemberReadGuard } from '../guard/member-read.guard';
import { MemberWriteGuard } from '../guard/member-write.guard';
import { RequestManager } from '../../permission/decorator/permission-manager.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { TargetMember } from '../decorator/target-member.decorator';
import { MemberModel } from '../entity/member.entity';
import { PermissionChurch } from '../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { GetMemberListDto } from '../dto/list/get-member-list.dto';
import { MemberDisplayColumn } from '../const/enum/list/display-column.enum';

@ApiTags('Churches:Members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @MemberReadGuard()
  getMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetMemberDto,
    @RequestManager() pm: ChurchUserModel,
  ) {
    return this.membersService.getMembers(churchId, pm, dto);
  }

  @Post()
  @MemberWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateMemberDto,
    @QueryRunner() qr: QR,
  ) {
    return this.membersService.createMember(churchId, dto, qr);
  }

  @Get('v2')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMemberList(
    @Param('churchId', ParseIntPipe) churchId: number,
    @PermissionChurch() church: ChurchModel,
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
    @Query() dto: GetSimpleMembersDto,
  ) {
    return this.membersService.getSimpleMembers(churchId, dto);
  }

  @Get(':memberId')
  @MemberReadGuard()
  getMemberById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @RequestManager() pm: ChurchUserModel,
  ) {
    return this.membersService.getMemberById(churchId, memberId, pm);
  }

  @Patch(':memberId')
  @MemberWriteGuard()
  patchMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateMemberDto,
    @PermissionChurch() church: ChurchModel,
    @TargetMember() targetMember: MemberModel,
  ) {
    return this.membersService.updateMember(church, targetMember, dto);
    //return this.membersService.updateMember(churchId, memberId, dto);
  }

  @Delete(':memberId')
  @MemberWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  deleteMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @PermissionChurch() church: ChurchModel,
    @TargetMember() targetMember: MemberModel,
    @QueryRunner() qr: QR,
  ) {
    return this.membersService.softDeleteMember(church, targetMember, qr);
    //return this.membersService.softDeleteMember(churchId, memberId, qr);
  }
}
