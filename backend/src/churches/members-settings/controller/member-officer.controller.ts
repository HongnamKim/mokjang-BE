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

@ApiTags('Churches:Members:Settings')
@Controller()
export class MemberOfficerController {
  constructor(private readonly memberOfficerService: MemberOfficerService) {}

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

  @Patch('ministries')
  @UseInterceptors(TransactionInterceptor)
  patchMemberMinistry() {}

  @Patch('groups')
  @UseInterceptors(TransactionInterceptor)
  patchMemberGroup() {}

  @Patch('educations')
  @UseInterceptors(TransactionInterceptor)
  patchMemberEducation() {}
}
