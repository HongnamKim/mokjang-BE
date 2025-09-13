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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddMembersToOfficerDto } from '../dto/request/members/add-members-to-officer.dto';
import { RemoveMembersFromOfficerDto } from '../dto/request/members/remove-members-from-officer.dto';
import { OfficerMembersService } from '../service/officer-members.service';
import { GetOfficerMembersDto } from '../dto/request/members/get-officer-members.dto';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { MinistryWriteGuard } from '../../ministries/guard/ministry-write.guard';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../permission/guard/church-manager.guard';

@ApiTags('Management:Officers:Members')
@Controller('officers/:officerId/members')
export class OfficersMembersController {
  constructor(private readonly officerMembersService: OfficerMembersService) {}

  @ApiOperation({ summary: '해당 직분 교인 조회' })
  @Get()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getOfficerMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('officerId', ParseIntPipe) officerId: number,
    @Query() dto: GetOfficerMembersDto,
  ) {
    return this.officerMembersService.getOfficerMembers(
      churchId,
      officerId,
      dto,
    );
  }

  @ApiOperation({ summary: '직분에 교인 추가' })
  @Patch()
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  addMembersToOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('officerId', ParseIntPipe) officerId: number,
    @Body() dto: AddMembersToOfficerDto,
    @QueryRunner() qr: QR,
  ) {
    return this.officerMembersService.addMembersToOfficer(
      churchId,
      officerId,
      dto,
      qr,
    );
  }

  @ApiOperation({ summary: '직분에서 교인 삭제' })
  @Delete()
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  deleteMembersFromOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('officerId', ParseIntPipe) officerId: number,
    @Body() dto: RemoveMembersFromOfficerDto,
    @QueryRunner() qr: QR,
  ) {
    return this.officerMembersService.removeMembersFromOfficer(
      churchId,
      officerId,
      dto,
      qr,
    );
  }
}
