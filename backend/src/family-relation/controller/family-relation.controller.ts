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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateFamilyRelationDto } from '../dto/create-family-relation.dto';
import { QueryRunner as QR } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import { UpdateFamilyRelationDto } from '../dto/update-family-relation.dto';
import {
  ApiDeleteFamilyMember,
  ApiGetFamilyMember,
  ApiPatchFamilyMember,
  ApiPostFamilyMember,
} from '../const/swagger/controller.swagger';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { FamilyRelationService } from '../service/family-relation.service';
import { FamilyWriteGuard } from '../guard/family-write.guard';
import { GetFamilyRelationListDto } from '../dto/get-family-relation-list.dto';
import { RequestManager } from '../../permission/decorator/permission-manager.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { RequestChurch } from '../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { FamilyReadGuard } from '../guard/family-read.guard';
import { TargetMember } from '../../members/decorator/target-member.decorator';
import { MemberModel } from '../../members/entity/member.entity';

@ApiTags('Churches:Members:Family')
@Controller(':memberId/family')
export class FamilyRelationController {
  constructor(private readonly familyService: FamilyRelationService) {}

  @ApiGetFamilyMember()
  @Get()
  @FamilyReadGuard()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getFamilyMember(
    @RequestManager() requestManager: ChurchUserModel,
    @RequestChurch() church: ChurchModel,
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() query: GetFamilyRelationListDto,
  ) {
    return this.familyService.getFamilyRelations(
      requestManager,
      church,
      memberId,
      query,
    );
  }

  @ApiPostFamilyMember()
  @Post()
  @FamilyWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @RequestManager() requestManager: ChurchUserModel,
    @RequestChurch() church: ChurchModel,
    @TargetMember() member: MemberModel,
    @Body() createFamilyDto: CreateFamilyRelationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.familyService.createFamilyMember(
      requestManager,
      church,
      member,
      createFamilyDto,
      qr,
    );
  }

  @ApiPatchFamilyMember()
  @Patch(':familyMemberId')
  @FamilyWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @RequestManager() requestManager: ChurchUserModel,
    @RequestChurch() church: ChurchModel,
    @TargetMember() member: MemberModel,
    @Param('familyMemberId', ParseIntPipe) familyMemberId: number,
    @Body() dto: UpdateFamilyRelationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.familyService.updateFamilyRelation(
      //churchId,
      //memberId,
      requestManager,
      church,
      member,
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
    @TargetMember() member: MemberModel,
    @Param('familyMemberId', ParseIntPipe) familyMemberId: number,
  ) {
    return this.familyService.deleteFamilyRelation(member, familyMemberId);
  }
}
