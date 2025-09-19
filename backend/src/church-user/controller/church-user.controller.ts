import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ChurchUserService } from '../service/church-user.service';
import { ApiTags } from '@nestjs/swagger';
import { GetChurchUsersDto } from '../dto/request/get-church-users.dto';
import { ChurchUserReadGuard } from '../guard/church-user-read.guard';
import { ChurchUserWriteGuard } from '../guard/church-user-write.guard';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { LinkMemberDto } from '../dto/request/link-member.dto';
import { UseTransaction } from '../../common/decorator/use-transaction.decorator';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import {
  ApiChangeMember,
  ApiGetChurchUserById,
  ApiGetChurchUsers,
  ApiLeaveChurch,
} from '../swagger/church-user.swagger';

@ApiTags('Churches:Church-Users')
@Controller('church-users')
export class ChurchUserController {
  constructor(private readonly churchUserService: ChurchUserService) {}

  @ApiGetChurchUsers()
  @Get()
  @ChurchUserReadGuard()
  getChurchUsers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetChurchUsersDto,
  ) {
    return this.churchUserService.getChurchUsers(church, dto);
  }

  @ApiGetChurchUserById()
  @Get(':churchUserId')
  @ChurchUserReadGuard()
  getChurchUserById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('churchUserId', ParseIntPipe) churchUserId: number,
    @RequestChurch() church: ChurchModel,
  ) {
    return this.churchUserService.getChurchUserById(church, churchUserId);
  }

  @ApiChangeMember()
  @Patch(':churchUserId/change-member')
  @ChurchUserWriteGuard()
  changeMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('churchUserId', ParseIntPipe) churchUserId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: LinkMemberDto,
  ) {
    return this.churchUserService.changeMemberLink(church, churchUserId, dto);
  }

  @ApiLeaveChurch()
  @Patch(':churchUserId/leave-church')
  @UseTransaction()
  @ChurchUserWriteGuard()
  leaveChurch(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('churchUserId', ParseIntPipe) churchUserId: number,
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.churchUserService.leaveChurchUser(church, churchUserId, qr);
  }

  /*@ApiOperation({
    deprecated: true,
    summary: '교회 가입 교인의 role 변경',
    description:
      '<h2>현개 개발 범위 외의 기능</h2>' +
      '<h2>교회에 가입한 교인의 role 을 변경합니다.</h2>' +
      '<p>변경 가능한 role: manager, member</p>',
  })
  @Patch(':churchUserId/role')
  @ChurchUserWriteGuard()
  patchUserRole(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('churchUserId', ParseIntPipe) churchUserId: number,
    @Body() dto: UpdateChurchUserRoleDto,
  ) {
    throw new BadRequestException('현재 개발 범위 외의 기능');
  }*/

  /*@ApiOperation({
    deprecated: true,
    summary: '계정 - 교인 정보 연결',
  })
  @ChurchUserWriteGuard()
  @Patch(':churchUserId/link-member')
  linkMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('churchUserId', ParseIntPipe) churchUserId: number,
    @Body() dto: LinkMemberDto,
    @RequestChurch() church: ChurchModel,
  ) {
    throw new GoneException('다른 엔드포인트로 대체 됨.');
  }*/

  /*@ApiOperation({
    deprecated: true,
    summary: '계정 - 교인 정보 연결 해제',
  })
  @Patch(':churchUserId/unlink-member')
  @ChurchUserWriteGuard()
  unlinkMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('churchUserId', ParseIntPipe) churchUserId: number,
    @RequestChurch() church: ChurchModel,
  ) {
    throw new GoneException('다른 엔드포인트로 대체 됨.');
  }*/
}
