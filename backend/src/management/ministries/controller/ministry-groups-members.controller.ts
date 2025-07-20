import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetMinistryGroupMembersDto } from '../dto/ministry-group/request/member/get-ministry-group-members.dto';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { AddMemberToMinistryGroupDto } from '../dto/ministry-group/request/member/add-member-to-ministry-group.dto';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { RemoveMembersFromMinistryGroupDto } from '../dto/ministry-group/request/member/remove-member-from-ministry-group.dto';
import { MinistryGroupMemberService } from '../service/ministry-group-member.service';
import { SearchMembersForMinistryGroupDto } from '../dto/ministry-group/request/member/search-members-for-ministry-group.dto';
import {
  ApiAddMemberToGroup,
  ApiGetMinistryGroupMembers,
  ApiRemoveMembersFromMinistryGroup,
  ApiSearchMembersForMinistryGroup,
} from '../const/swagger/ministry-group-member.swagger';

@ApiTags('Management:MinistryGroups:Members')
@Controller('ministry-groups')
export class MinistryGroupsMembersController {
  constructor(
    private readonly ministryGroupMemberService: MinistryGroupMemberService,
  ) {}

  @ApiSearchMembersForMinistryGroup()
  @Get(':ministryGroupId/member-search')
  searchMembersForMinistryGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Query() dto: SearchMembersForMinistryGroupDto,
  ) {
    return this.ministryGroupMemberService.searchMembersForMinistryGroup(
      churchId,
      ministryGroupId,
      dto,
    );
  }

  @ApiGetMinistryGroupMembers()
  @Get(':ministryGroupId/members')
  getMinistryGroupMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Query() dto: GetMinistryGroupMembersDto,
  ) {
    return this.ministryGroupMemberService.getMinistryGroupMembers(
      churchId,
      ministryGroupId,
      dto,
    );
  }

  @ApiAddMemberToGroup()
  @Patch(':ministryGroupId/members')
  @UseInterceptors(TransactionInterceptor)
  addMemberToGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Body() dto: AddMemberToMinistryGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupMemberService.addMemberToMinistryGroup(
      churchId,
      ministryGroupId,
      dto,
      qr,
    );
  }

  @ApiRemoveMembersFromMinistryGroup()
  @Delete(':ministryGroupId/members')
  @UseInterceptors(TransactionInterceptor)
  removeMembersFromMinistryGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Body() dto: RemoveMembersFromMinistryGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupMemberService.removeMembersFromMinistryGroup(
      churchId,
      ministryGroupId,
      dto.memberIds,
      qr,
    );
  }
}
