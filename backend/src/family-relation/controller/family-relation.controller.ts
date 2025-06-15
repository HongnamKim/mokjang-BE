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
import { CreateFamilyRelationDto } from '../dto/create-family-relation.dto';
import { QueryRunner as QR } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import { UpdateFamilyRelationDto } from '../dto/update-family-relation.dto';
import {
  ApiDeleteFamilyMember,
  ApiFetchFamilyMember,
  ApiGetFamilyMember,
  ApiPatchFamilyMember,
  ApiPostFamilyMember,
} from '../const/swagger/controller.swagger';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { FamilyRelationService } from '../service/family-relation.service';
import { FamilyReadGuard } from '../guard/family-read.guard';
import { FamilyWriteGuard } from '../guard/family-write.guard';

@ApiTags('Churches:Members:Family')
@Controller(':memberId/family')
export class FamilyRelationController {
  constructor(private readonly familyService: FamilyRelationService) {}

  @ApiGetFamilyMember()
  @Get()
  @FamilyReadGuard()
  getFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.familyService.getFamilyRelations(churchId, memberId);
  }

  @ApiPostFamilyMember()
  @Post()
  @FamilyWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() createFamilyDto: CreateFamilyRelationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.familyService.createFamilyMember(
      churchId,
      memberId,
      createFamilyDto,
      qr,
    );
  }

  @ApiFetchFamilyMember()
  @Post('fetch-family')
  @FamilyWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  fetchFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: CreateFamilyRelationDto,
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
  @FamilyWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('familyMemberId', ParseIntPipe) familyMemberId: number,
    @Body() dto: UpdateFamilyRelationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.familyService.updateFamilyRelation(
      churchId,
      memberId,
      familyMemberId,
      dto.relation,
      qr,
    );
  }

  @ApiDeleteFamilyMember()
  @Delete(':familyMemberId')
  @FamilyWriteGuard()
  deleteFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('familyMemberId', ParseIntPipe) familyMemberId: number,
  ) {
    return this.familyService.deleteFamilyRelation(
      churchId,
      memberId,
      familyMemberId,
    );
  }
}
