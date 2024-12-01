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
import { CreateFamilyDto } from './dto/family/create-family.dto';
import { FamilyService } from './family.service';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import { UpdateFamilyDto } from './dto/family/update-family.dto';

@ApiTags('Churches:Believers:Family')
@Controller(':believerId/family')
export class BelieversFamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get()
  getFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('believerId', ParseIntPipe) believerId: number,
  ) {
    return this.familyService.getFamilyMember(churchId, believerId);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  postFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('believerId', ParseIntPipe) believerId: number,
    @Body() dto: CreateFamilyDto,
    @QueryRunner() qr: QR,
  ) {
    return this.familyService.postFamilyMember(
      churchId,
      believerId,
      dto.familyId,
      dto.relation,
      qr,
    );
  }

  @Patch(':familyMemberId')
  @UseInterceptors(TransactionInterceptor)
  patchFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('believerId', ParseIntPipe) believerId: number,
    @Param('familyMemberId', ParseIntPipe) familyMemberId: number,
    @Body() dto: UpdateFamilyDto,
    @QueryRunner() qr: QR,
  ) {
    return this.familyService.updateFamilyRelation(
      churchId,
      believerId,
      familyMemberId,
      dto.relation,
      qr,
    );
  }

  @Delete(':familyMemberId')
  deleteFamilyMember() {}
}
