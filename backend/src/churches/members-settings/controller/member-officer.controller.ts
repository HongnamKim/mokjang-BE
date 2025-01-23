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
import { MemberOfficerService } from '../service/member-officer.service';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import { GetOfficerHistoryDto } from '../dto/officer/get-officer-history.dto';
import { SetMemberOfficerDto } from '../dto/officer/set-member-officer.dto';
import { EndMemberOfficeDto } from '../dto/officer/end-member-officer.dto';
import { UpdateOfficerHistoryDto } from '../dto/officer/update-officer-history.dto';
import {
  ApiDeleteOfficerHistory,
  ApiEndMemberOfficer,
  ApiGetMemberOfficerHistory,
  ApiPatchOfficerHistory,
  ApiPostMemberOfficer,
} from '../const/swagger/officer/controller.swagger';

@ApiTags('Churches:Members:Officer')
@Controller('officers')
export class MemberOfficerController {
  constructor(private readonly memberOfficerService: MemberOfficerService) {}

  @ApiGetMemberOfficerHistory()
  @Get()
  getMemberOfficerHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetOfficerHistoryDto,
  ) {
    return this.memberOfficerService.getMemberOfficerHistory(
      churchId,
      memberId,
      dto,
    );
  }

  @ApiPostMemberOfficer()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postMemberOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: SetMemberOfficerDto,
    @QueryRunner() qr: QR,
  ) {
    return this.memberOfficerService.setMemberOfficer(
      churchId,
      memberId,
      dto,
      qr,
    );
  }

  @ApiEndMemberOfficer()
  @Delete()
  @UseInterceptors(TransactionInterceptor)
  endMemberOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: EndMemberOfficeDto,
    @QueryRunner() qr: QR,
  ) {
    return this.memberOfficerService.endMemberOfficer(
      churchId,
      memberId,
      dto,
      qr,
    );
  }

  @ApiPatchOfficerHistory()
  @Patch(':officerHistoryId')
  @UseInterceptors(TransactionInterceptor)
  patchOfficerHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('officerHistoryId', ParseIntPipe) officerHistoryId: number,
    @Body() dto: UpdateOfficerHistoryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.memberOfficerService.updateOfficerHistory(
      churchId,
      memberId,
      officerHistoryId,
      dto,
      qr,
    );
  }

  @ApiDeleteOfficerHistory()
  @Delete(':officerHistoryId')
  deleteOfficerHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('officerHistoryId', ParseIntPipe) officerHistoryId: number,
  ) {
    return this.memberOfficerService.deleteOfficerHistory(
      churchId,
      memberId,
      officerHistoryId,
    );
  }
}
