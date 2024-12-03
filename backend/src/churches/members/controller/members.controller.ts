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
import { MembersService } from '../service/members.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateMemberDto } from '../dto/create-member.dto';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { DefaultMemberRelationOption } from '../const/default-find-options.const';
import { GetMemberDto } from '../dto/get-member.dto';

@ApiTags('Churches:Members')
@Controller()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  getMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetMemberDto,
  ) {
    return this.membersService.getMembers(churchId, dto);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  postMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateMemberDto,
    @QueryRunner() qr: QR,
  ) {
    return this.membersService.createMember(churchId, dto, qr);
  }

  @Get(':memberId')
  getMemberById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.membersService.getMemberById(
      churchId,
      memberId,
      DefaultMemberRelationOption,
    );
  }

  @Patch(':memberId')
  patchMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.membersService.updateMember(churchId, memberId, dto);
  }

  @Delete(':memberId')
  deleteMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.membersService.deleteMember(churchId, memberId);
  }
}
