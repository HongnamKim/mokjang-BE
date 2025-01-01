import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { MemberEducationService } from '../service/member-education.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { UpdateMemberEducationDto } from '../dto/update-member-education.dto';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { CreateEducationHistoryDto } from '../dto/education/create-education-history.dto';
import { UpdateEducationHistoryDto } from '../dto/education/update-education-history.dto';

@ApiTags('Churches:Members:Educations')
@Controller('educations')
export class MemberEducationController {
  constructor(
    private readonly memberEducationService: MemberEducationService,
  ) {}

  @ApiOperation({
    summary: '교인의 교육이수 이력 조회',
    description: '교인의 교육이수 이력을 수료 날짜의 내림차순으로 조회합니다.',
  })
  @Get()
  getMemberEducationHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.memberEducationService.getMemberEducationHistory(
      churchId,
      memberId,
    );
  }

  @Post()
  createMemberEducationHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: CreateEducationHistoryDto,
  ) {
    return this.memberEducationService.createMemberEducationHistory(
      churchId,
      memberId,
      dto,
    );
  }

  @ApiOperation({
    summary: '교인의 교육이수 수정/삭제',
    description:
      '<p>isDeleteEducation 가 true 일 경우 사역 삭제</p>' +
      '<p>isDeleteEducation, educationId 모두 필수값</p>' +
      '<p>이미 부여된 교육 등록 시 BadRequestException("이미 등록된 교육입니다.")</p>' +
      '<p>부여되지 않은 교육 삭제 시 BadRequestException("등록되지 않은 교육을 삭제할 수 없습니다.")</p>',
  })
  @Patch()
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

  @Patch(':educationHistoryId')
  updateMemberEducationHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('educationHistoryId', ParseIntPipe) educationHistoryId: number,
    @Body() dto: UpdateEducationHistoryDto,
  ) {
    return this.memberEducationService.updateEducationHistory(
      memberId,
      educationHistoryId,
      dto,
    );
  }

  @ApiOperation({})
  @Delete(':educationHistoryId')
  deleteMemberEducationHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('educationHistoryId', ParseIntPipe) educationHistoryId: number,
  ) {
    return this.memberEducationService.deleteEducationHistory(
      memberId,
      educationHistoryId,
    );
  }
}
