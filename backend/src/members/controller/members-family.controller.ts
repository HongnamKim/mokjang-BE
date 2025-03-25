import {
  Body,
  Controller,
  Delete,
  Get,
  GoneException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { CreateFamilyDto } from '../dto/family/create-family.dto';
import { QueryRunner as QR } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import { UpdateFamilyDto } from '../dto/family/update-family.dto';
import { MembersService } from '../service/members.service';
import {
  ApiDeleteFamilyMember,
  ApiFetchFamilyMember,
  ApiGetFamilyMember,
  ApiPatchFamilyMember,
  ApiPostFamilyMember,
} from '../const/swagger/member-family/controller.swagger';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';

@ApiTags('Churches:Members:Family')
@Controller(':memberId/family')
export class MembersFamilyController {
  constructor(private readonly memberService: MembersService) {}

  @ApiGetFamilyMember()
  @Get()
  getFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.memberService.getFamilyRelation(churchId, memberId);
  }

  @ApiPostFamilyMember()
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

  @ApiFetchFamilyMember()
  @Post('fetch-family')
  @UseInterceptors(TransactionInterceptor)
  fetchFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: CreateFamilyDto,
    @QueryRunner() qr: QR,
  ) {
    throw new GoneException('더 이상 사용할 수 없는 요청입니다.');

    /*return this.memberService.fetchFamilyRelation(
      churchId,
      memberId,
      dto.familyMemberId,
      dto.relation,
      qr,
    );*/
  }

  @ApiPatchFamilyMember()
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

  @ApiDeleteFamilyMember()
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
