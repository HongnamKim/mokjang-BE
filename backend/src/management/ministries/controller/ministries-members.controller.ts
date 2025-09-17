import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiRefreshMinistryMembersCount } from '../const/swagger/ministry.swagger';
import { MinistryWriteGuard } from '../guard/ministry-write.guard';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { AssignMinistryToMemberDto } from '../dto/ministry/request/member/assign-ministry-to-member.dto';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { RemoveMinistryFromMember } from '../dto/ministry/request/member/remove-ministry-from-member.dto';
import { MinistryMemberService } from '../service/ministry-member.service';
import { RequestChurch } from '../../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';

@ApiTags('Management:MinistryGroups:Ministries:Members')
@Controller('ministry-groups/:ministryGroupId/ministries/:ministryId')
export class MinistriesMembersController {
  constructor(private readonly ministryMemberService: MinistryMemberService) {}

  @ApiRefreshMinistryMembersCount()
  @MinistryWriteGuard()
  @Patch('refresh-members-count')
  refreshMembersCount(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
    @RequestChurch() church: ChurchModel,
  ) {
    return this.ministryMemberService.refreshMinistryMemberCount(
      church,
      ministryGroupId,
      ministryId,
    );
  }

  @ApiOperation({
    summary: '교인에게 사역 부여',
    description:
      '<h2>교인에게 사역을 부여</h2>' +
      '<p>같은 사역 그룹에 속한 교인 + 사역만 가능</p>' +
      '<p>기존 사역이 있을 경우, 기존 사역은 종료 처리</p>',
  })
  @Patch('members')
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  addMemberToMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: AssignMinistryToMemberDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryMemberService.assignMemberToMinistry(
      church,
      ministryGroupId,
      ministryId,
      dto,
      qr,
    );
  }

  @Delete('members')
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  removeMemberFromMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: RemoveMinistryFromMember,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryMemberService.removeMemberFromMinistry(
      church,
      ministryGroupId,
      ministryId,
      dto,
      qr,
    );
  }
}
