import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
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
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../permission/guard/church-manager.guard';
import { MinistryWriteGuard } from '../guard/ministry-write.guard';
import { RequestChurch } from '../../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { RequestManager } from '../../../permission/decorator/request-manager.decorator';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

@ApiTags('Management:MinistryGroups:Members')
@Controller('ministry-groups')
export class MinistryGroupsMembersController {
  constructor(
    private readonly ministryGroupMemberService: MinistryGroupMemberService,
  ) {}

  @ApiSearchMembersForMinistryGroup()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @Get(':ministryGroupId/member-search')
  searchMembersForMinistryGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Query() dto: SearchMembersForMinistryGroupDto,
  ) {
    return this.ministryGroupMemberService.searchMembersForMinistryGroup(
      church,
      requestManager,
      ministryGroupId,
      dto,
    );
  }

  @ApiGetMinistryGroupMembers()
  @Get(':ministryGroupId/members')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMinistryGroupMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Query() dto: GetMinistryGroupMembersDto,
  ) {
    return this.ministryGroupMemberService.getMinistryGroupMembers(
      church,
      requestManager,
      ministryGroupId,
      dto,
    );
  }

  @ApiAddMemberToGroup()
  @Patch(':ministryGroupId/members')
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  addMemberToGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: AddMemberToMinistryGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupMemberService.addMemberToMinistryGroup(
      church,
      ministryGroupId,
      dto,
      qr,
    );
  }

  @ApiRemoveMembersFromMinistryGroup()
  @Delete(':ministryGroupId/members')
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  removeMembersFromMinistryGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: RemoveMembersFromMinistryGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupMemberService.removeMembersFromMinistryGroup(
      church,
      ministryGroupId,
      dto,
      qr,
    );
  }
}
