import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ChurchUserService } from '../service/church-user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetChurchUsersDto } from '../dto/request/get-church-users.dto';
import { UpdateChurchUserRoleDto } from '../dto/request/update-church-user-role.dto';

@ApiTags('Churches:Church-Users')
@Controller('church-users')
export class ChurchUserController {
  constructor(private readonly churchUserService: ChurchUserService) {}

  @ApiOperation({
    summary: '교회 가입 계정(교인) 조회',
  })
  @Get()
  getChurchUsers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetChurchUsersDto,
  ) {
    return this.churchUserService.getChurchUsers(churchId, dto);
  }

  @ApiOperation({
    summary: '교회 가입 계정(교인) 단건 조회',
  })
  @Get(':userId')
  getChurchUserById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.churchUserService.getChurchUserByUserId(churchId, userId);
  }

  @ApiOperation({
    deprecated: true,
    summary: '교회 가입 교인의 role 변경',
    description:
      '<h2>현개 개발 범위 외의 기능</h2>' +
      '<h2>교회에 가입한 교인의 role 을 변경합니다.</h2>' +
      '<p>변경 가능한 role: manager, member</p>',
  })
  @Patch(':userId/role')
  patchUserRole(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateChurchUserRoleDto,
  ) {
    throw new BadRequestException('현재 개발 범위 외의 기능');

    //return this.churchUserService.patchChurchUserRole(churchId, userId, dto);
  }

  @ApiOperation({
    summary: '계정 - 교인 정보 연결',
  })
  @Patch(':userId/link-member')
  linkMember() {
    return '개발 전';
  }

  @ApiOperation({
    summary: '계정 - 교인 정보 연결 해제',
  })
  @Patch(':userId/unlink-member')
  unlinkMember() {
    return '개발 전';
  }

  @ApiOperation({
    summary: '교회 계정 가입 취소',
  })
  @Patch(':userId/leave-church')
  leaveChurch() {
    return '개발 전';
  }
}
