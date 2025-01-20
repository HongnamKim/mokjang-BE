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
export class MemberSettingsController {
  constructor(
    private readonly memberOfficerService: MemberOfficerService,
    //private readonly memberMinistryService: MemberMinistryService,
    //private readonly memberEducationService: EducationHistoryService,
    //private readonly memberGroupService: MemberGroupService,
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

  /*@ApiOperation({
    summary: '교인의 사역 수정/삭제',
    description:
      '<p>isDeleteMinistry 가 true 일 경우 사역 삭제</p>' +
      '<p>isDeleteMinistry, ministryId 모두 필수값</p>' +
      '<p>이미 부여된 사역 등록 시 BadRequestException("이미 부여된 사역입니다.")</p>' +
      '<p>부여되지 않은 사역 삭제 시 BadRequestException("부여되지 않은 사역을 삭제할 수 없습니다.")</p>',
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
  }*/

  /*@ApiOperation({
    summary: '교인의 교육이수 수정/삭제',
    description:
      '<p>isDeleteEducation 가 true 일 경우 사역 삭제</p>' +
      '<p>isDeleteEducation, educationId 모두 필수값</p>' +
      '<p>이미 부여된 교육 등록 시 BadRequestException("이미 등록된 교육입니다.")</p>' +
      '<p>부여되지 않은 교육 삭제 시 BadRequestException("등록되지 않은 교육을 삭제할 수 없습니다.")</p>',
  })
  @Patch('educations')
  @UseInterceptors(TransactionInterceptor)
  patchMemberEducation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateMemberEducationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.memberEducationService.updateMemberEducation(
      churchId,
      memberId,
      dto,
      qr,
    );
  }

  @Get('educations')
  getMemberEducationHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.memberEducationService.getMemberEducationHistory(
      churchId,
      memberId,
    );
  }*/

  /*@ApiOperation({
    summary: '교인의 소그룹 수정/삭제',
    description:
      '<p>isDeleteEducation 가 true 일 경우 소그룹 삭제</p>' +
      '<p>isDeleteEducation 필수, groupId 그룹 등록 시 필수, 그룹 삭제 시 생략 가능</p>' +
      '<p>이미 소속된 소그룹 등록 시 BadRequestException("이미 등록된 소그룹입니다.")</p>' +
      '<p>부여되지 않은 소그룹 삭제 시 BadRequestException("등록되지 않은 소그룹을 삭제할 수 없습니다.")</p>',
  })
  @Patch('groups')
  @UseInterceptors(TransactionInterceptor)
  patchMemberGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body(UpdateMemberGroupPipe) dto: UpdateMemberGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.memberGroupService.updateMemberGroup(
      churchId,
      memberId,
      dto,
      qr,
    );
  }*/
}
