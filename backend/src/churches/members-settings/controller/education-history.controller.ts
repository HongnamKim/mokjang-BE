import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { CreateEducationHistoryDto } from '../dto/education/create-education-history.dto';
import { UpdateEducationHistoryDto } from '../dto/education/update-education-history.dto';
import { UpdateEducationHistoryPipe } from '../pipe/update-education-history-pipe.service';
import { GetEducationHistoryDto } from '../dto/education/get-education-history.dto';
import { EducationHistoryService } from '../service/education-history.service';

@ApiTags('Churches:Members:Educations')
@Controller('educations')
export class EducationHistoryController {
  constructor(
    private readonly educationHistoryService: EducationHistoryService,
  ) {}

  @ApiOperation({
    summary: '교인의 교육 이력 조회',
    description: '교인의 교육 이력을 수료 날짜의 내림차순으로 조회합니다.',
  })
  @Get()
  getMemberEducationHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetEducationHistoryDto,
  ) {
    return this.educationHistoryService.getMemberEducationEnrollments(
      memberId,
      dto,
    );
  }

  @ApiOperation({
    deprecated: true,
    summary: '교인의 교육 이력 생성',
    description:
      "<p>status: 'inProgress', 'completed', 'incomplete'</p>" +
      '<p>교육이수에 대한 중복 체크는 수행하지 않습니다.</p>',
  })
  @Post()
  @UseInterceptors(TransactionInterceptor)
  createMemberEducationHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: CreateEducationHistoryDto,
    @QueryRunner() qr: QR,
  ) {
    /*return this.educationHistoryService.createEducationHistory(
      churchId,
      memberId,
      dto,
      qr,
    );*/
  }

  @ApiOperation({
    deprecated: true,
    summary: '교인의 교육 이력 수정/삭제',
    description:
      '<p>isDeleteEducation 가 true 일 경우 사역 삭제</p>' +
      '<p>isDeleteEducation, educationId 모두 필수값</p>' +
      '<p>이미 부여된 교육 등록 시 BadRequestException("이미 등록된 교육입니다.")</p>' +
      '<p>부여되지 않은 교육 삭제 시 BadRequestException("등록되지 않은 교육을 삭제할 수 없습니다.")</p>',
  })
  @Patch()
  patchMemberEducation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    throw new BadRequestException('DEPRECATED');
  }

  @ApiOperation({
    deprecated: true,
    summary: '교인의 교육 이력 수정',
    description:
      '<p>교인의 교육이수 이력을 수정합니다.</p>' +
      '<p>교육, 시작일, 종료일, 이수상태를 수정할 수 있습니다.</p>' +
      '<p>존재하지 않는 교육으로 수정할 경우 NotFoundException 을 반환합니다.</p>' +
      '<p>존재하지 않는 이력에 대한 수정을 시도할 경우 NotFoundException 을 반환합니다.</p>',
  })
  @Patch(':educationHistoryId')
  @UseInterceptors(TransactionInterceptor)
  updateMemberEducationHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('educationHistoryId', ParseIntPipe) educationHistoryId: number,
    @Body(UpdateEducationHistoryPipe) dto: UpdateEducationHistoryDto,
    @QueryRunner() qr: QR,
  ) {
    /*return this.educationHistoryService.updateEducationHistory(
      churchId,
      memberId,
      educationHistoryId,
      dto,
      qr,
    );*/
  }

  @ApiOperation({
    deprecated: true,
    summary: '교인의 교육 이력 삭제',
    description:
      '<p>교인의 교육이수 이력을 삭제합니다.</p>' +
      '<p>존재하지 않는 이력에 대한 삭제를 시도할 경우 NotFoundException 을 반환합니다.</p>',
  })
  @Delete(':educationHistoryId')
  @UseInterceptors(TransactionInterceptor)
  deleteMemberEducationHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('educationHistoryId', ParseIntPipe) educationHistoryId: number,
    @QueryRunner() qr: QR,
  ) {
    /*return this.educationHistoryService.deleteEducationHistory(
      memberId,
      educationHistoryId,
      qr,
    );*/
  }
}
