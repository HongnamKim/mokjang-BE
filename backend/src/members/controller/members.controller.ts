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

@ApiTags('Churches:Members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @MemberReadGuard()
  getMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetMemberDto,
  ) {
    return this.membersService.getMembers(churchId, dto);
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

  @Get('simple')
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
  ) {
    return this.membersService.getMemberById(churchId, memberId);
  }

  @Patch(':memberId')
  @MemberWriteGuard()
  patchMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.membersService.updateMember(churchId, memberId, dto);
  }

  @Delete(':memberId')
  @MemberWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  deleteMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.membersService.softDeleteMember(churchId, memberId, qr);
  }
}
