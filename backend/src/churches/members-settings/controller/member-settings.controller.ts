import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { MemberOfficerService } from '../service/member-officer.service';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateMemberOfficerDto } from '../dto/update-member-officer.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateMemberOfficerPipe } from '../pipe/update-member-officer.pipe';
import { MemberMinistryService } from '../service/member-ministry.service';
import { UpdateMemberMinistryDto } from '../dto/update-member-ministry.dto';

@ApiTags('Churches:Members:Settings')
@Controller()
export class MemberSettingsController {
  constructor(
    private readonly memberOfficerService: MemberOfficerService,
    private readonly memberMinistryService: MemberMinistryService,
  ) {}

  @ApiOperation({
    summary: '교인의 직분 수정/삭제',
    description:
      '<p>isDeleteOfficer 가 true 일 경우 직분 삭제</p>' +
      '<p>false 일 경우 직분 수정, 직분 ID 값이 없을 경우 BadRequestException</p>',
  })
  @Patch('officers')
  @UseInterceptors(TransactionInterceptor)
  patchMemberOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body(UpdateMemberOfficerPipe) dto: UpdateMemberOfficerDto,
    @QueryRunner() qr: QR,
  ) {
    return this.memberOfficerService.updateOfficer(churchId, memberId, dto, qr);
  }

  @ApiOperation({
    summary: '교인의 사역 수정/삭제',
    description:
      '<p>isDeleteMinistry 가 true 일 경우 사역 삭제</p>' +
      '<p>isDeleteMinistry, ministryId 모두 필수값</p>',
  })
  @Patch('ministries')
  @UseInterceptors(TransactionInterceptor)
  patchMemberMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateMemberMinistryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.memberMinistryService.updateMemberMinistry(
      churchId,
      memberId,
      dto,
      qr,
    );
  }

  @Patch('groups')
  @UseInterceptors(TransactionInterceptor)
  patchMemberGroup() {}

  @Patch('educations')
  @UseInterceptors(TransactionInterceptor)
  patchMemberEducation() {}
}
