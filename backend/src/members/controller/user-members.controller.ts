import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUserMemberDto } from '../dto/get-user-member.dto';
import { UpdateMemberRoleDto } from '../dto/role/update-member-role.dto';
import { UserMembersService } from '../service/user-members.service';

@ApiTags('Churches:User-Members')
@Controller('user-members')
export class UserMembersController {
  constructor(private readonly userMembersService: UserMembersService) {}

  @Get()
  getUserMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetUserMemberDto,
  ) {
    return this.userMembersService.getUserMembers(churchId, dto);
  }

  @Get(':memberId')
  getUserMemberById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.userMembersService.getUserMemberById(churchId, memberId);
  }

  @Patch(':memberId/role')
  patchUserMemberRole(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.userMembersService.updateMemberRole(churchId, memberId, dto);
  }
}
