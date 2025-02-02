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
import { CreateFamilyDto } from '../dto/family/create-family.dto';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import { UpdateFamilyDto } from '../dto/family/update-family.dto';
import { MembersService } from '../service/members.service';

@ApiTags('Churches:Members:Family')
@Controller(':memberId/family')
export class MembersFamilyController {
  constructor(private readonly memberService: MembersService) {}

  @Get()
  getFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.memberService.getFamilyRelation(churchId, memberId);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  postFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() createFamilyDto: CreateFamilyDto,
    @QueryRunner() qr: QR,
  ) {
    return this.memberService.createFamilyRelation(
      churchId,
      memberId,
      createFamilyDto,
      qr,
    );
  }

  @Post('fetch-family')
  @UseInterceptors(TransactionInterceptor)
  fetchFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: CreateFamilyDto,
    @QueryRunner() qr: QR,
  ) {
    return this.memberService.fetchFamilyRelation(
      churchId,
      memberId,
      dto.familyMemberId,
      dto.relation,
      qr,
    );
  }

  @Patch(':familyMemberId')
  @UseInterceptors(TransactionInterceptor)
  patchFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('familyMemberId', ParseIntPipe) familyMemberId: number,
    @Body() dto: UpdateFamilyDto,
    @QueryRunner() qr: QR,
  ) {
    return this.memberService.patchFamilyRelation(
      churchId,
      memberId,
      familyMemberId,
      dto.relation,
      qr,
    );
  }

  @Delete(':familyMemberId')
  deleteFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('familyMemberId', ParseIntPipe) familyMemberId: number,
  ) {
    return this.memberService.deleteFamilyRelation(
      churchId,
      memberId,
      familyMemberId,
    );
  }
}
