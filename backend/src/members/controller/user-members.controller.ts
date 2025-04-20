import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetManagerMemberDto } from '../dto/get-manager-member.dto';
import { MembersService } from '../service/members.service';
import { GetMemberDto } from '../dto/get-member.dto';

@ApiTags('Churches:User-Members')
@Controller('user-members')
export class UserMembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  getUserMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetMemberDto,
  ) {
    return this.membersService.getUserMembers(churchId, dto);
  }

  @Get('managers')
  getManagerMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetManagerMemberDto,
  ) {
    return this.membersService.getMembers(churchId, dto, undefined, true);
  }
}
