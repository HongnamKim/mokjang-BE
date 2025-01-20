import {
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
import { ApiTags } from '@nestjs/swagger';
import { MemberMinistryService } from '../service/member-ministry.service';
import { CreateMemberMinistryDto } from '../dto/ministry/create-member-ministry.dto';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { EndMemberMinistryDto } from '../dto/ministry/end-member-ministry.dto';
import { GetMinistryHistoryDto } from '../dto/ministry/get-ministry-history.dto';
import { UpdateMinistryHistoryDto } from '../dto/ministry/update-ministry-history.dto';
import {
  ApiDeleteMemberMinistry,
  ApiDeleteMinistryHistory,
  ApiGetMemberMinistry,
  ApiGetMinistryHistory,
  ApiPatchMinistryHistory,
  ApiPostMemberMinistry,
} from '../const/swagger/ministry/controller.swagger';

@ApiTags('Churches:Members:Ministries')
@Controller('ministries')
export class MemberMinistryController {
  constructor(private readonly memberMinistryService: MemberMinistryService) {}

  // 교인의 사역 조회 (현재)
  @ApiGetMemberMinistry()
  @Get()
  getMemberMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetMinistryHistoryDto,
  ) {
    return this.memberMinistryService.getCurrentMemberMinistry(
      churchId,
      memberId,
      dto,
    );
  }

  // 교인에게 현재 사역 부여
  // member 와 N:N relation 추가
  // ministryHistory 추가 (시작일)
  @ApiPostMemberMinistry()
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
  //@Patch(':ministryId')
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
  @ApiDeleteMemberMinistry()
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
  @ApiGetMinistryHistory()
  //@Get('history')
  getMinistryHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetMinistryHistoryDto,
  ) {
    /*return this.memberMinistryService.getMinistryHistory(
      churchId,
      memberId,
      dto,
    );*/
    //return 'get history';
  }

  // 교인의 사역 이력 수정
  // 사역의 시작 날짜, 종료 날짜만 수정 가능
  @ApiPatchMinistryHistory()
  @Patch('history/:ministryHistoryId')
  patchMinistryHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryHistoryId', ParseIntPipe)
    ministryHistoryId: number,
    @Body() dto: UpdateMinistryHistoryDto,
  ) {
    return this.memberMinistryService.updateMinistryHistory(
      churchId,
      memberId,
      ministryHistoryId,
      dto,
    );
  }

  // 교인의 사역 이력 삭제
  @ApiDeleteMinistryHistory()
  @Delete('history/:ministryHistoryId')
  deleteMinistryHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryHistoryId', ParseIntPipe)
    ministryHistoryId: number,
  ) {
    return this.memberMinistryService.deleteMinistryHistory(
      churchId,
      memberId,
      ministryHistoryId,
    );
  }
}
