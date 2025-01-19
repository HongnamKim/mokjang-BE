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
import { ApiTags } from '@nestjs/swagger';
import { MemberMinistryService } from '../service/member-ministry.service';
import { CreateMemberMinistryDto } from '../dto/ministry/create-member-ministry.dto';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { EndMemberMinistryDto } from '../dto/ministry/end-member-ministry.dto';

@ApiTags('Churches:Members:Ministries')
@Controller('ministries')
export class MemberMinistryController {
  constructor(private readonly memberMinistryService: MemberMinistryService) {}

  // 교인의 사역 조회 (현재)
  @Get()
  getMemberMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.memberMinistryService.getMemberMinistry(churchId, memberId);
  }

  // 교인에게 현재 사역 부여
  // member 와 N:N relation 추가
  // ministryHistory 추가 (시작일)
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postMemberMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: CreateMemberMinistryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.memberMinistryService.createMemberMinistry(
      churchId,
      memberId,
      dto,
      qr,
    );
  }

  // 교인의 현재 사역 수정
  // N:N relation 수정
  // 현재 ministryHistory 의 ministry 수정 (날짜 수정은 patchMinistryHistory 에서 담당)
  @Patch(':ministryId')
  patchMemberMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
  ) {
    return 'patch ministry';
  }

  // 교인의 현재 사역 삭제 + 종료
  // N:N relation 삭제
  // 현재 ministryHistory 삭제 + 해당 MinistryHistoryModel 에 endDate 추가
  @Delete(':ministryId')
  @UseInterceptors(TransactionInterceptor)
  deleteMemberMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
    @Body() dto: EndMemberMinistryDto,
    @QueryRunner() qr: QR,
  ) {
    //return 'delete Ministry';
    return this.memberMinistryService.deleteMemberMinistry(
      churchId,
      memberId,
      ministryId,
      dto,
      qr,
    );
  }

  // 교인의 사역 이력 조회
  @Get('history')
  getMinistryHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return 'get history';
  }

  // 교인의 사역 이력 수정
  // 사역의 시작 날짜, 종료 날짜만 수정 가능
  @Patch('history/:ministryHistoryId')
  patchMinistryHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryHistoryHistoryId', ParseIntPipe)
    ministryHistoryHistoryId: number,
  ) {
    return 'patch ministryHistory';
  }

  // 교인의 사역 이력 삭제
  @Delete('history/:ministryHistoryId')
  deleteMinistryHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryHistoryHistoryId', ParseIntPipe)
    ministryHistoryHistoryId: number,
  ) {
    return 'delete ministryHistory';
  }
}
