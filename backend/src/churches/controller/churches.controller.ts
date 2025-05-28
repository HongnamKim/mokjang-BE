import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChurchesService } from '../service/churches.service';
import { CreateChurchDto } from '../dto/create-church.dto';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Token } from '../../auth/decorator/jwt.decorator';
import { JwtAccessPayload } from '../../auth/type/jwt';
import {
  ChurchOwnerGuard,
  ChurchManagerGuard,
} from '../guard/church-guard.service';
import { UpdateChurchDto } from '../dto/update-church.dto';
import {
  ApiDeleteChurch,
  ApiGetAllChurches,
  ApiGetChurchById,
  ApiPatchChurch,
  ApiPostChurch,
} from '../const/swagger/churches/controller.swagger';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateChurchJoinCodeDto } from '../dto/update-church-join-code.dto';
import { TransferOwnerDto } from '../dto/transfer-owner.dto';

@Controller('churches')
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @ApiGetAllChurches()
  @Get()
  getAllChurches() {
    return this.churchesService.findAllChurches();
  }

  @ApiPostChurch()
  @Post()
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  postChurch(
    @Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @Body() dto: CreateChurchDto,
    @QueryRunner() qr: QR,
  ) {
    return this.churchesService.createChurch(accessPayload, dto, qr);
  }

  @ApiGetChurchById()
  @Get(':churchId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getChurchById(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.churchesService.getChurchById(churchId);
  }

  @ApiPatchChurch()
  @Patch(':churchId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, ChurchOwnerGuard)
  patchChurch(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: UpdateChurchDto,
  ) {
    return this.churchesService.updateChurch(churchId, dto);
  }

  @ApiDeleteChurch()
  @Delete(':churchId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, ChurchOwnerGuard)
  deleteChurch(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.churchesService.deleteChurchById(churchId);
  }

  @ApiOperation({
    summary: '가입 코드 수정',
  })
  @Patch(':churchId/join-code')
  @UseGuards(AccessTokenGuard, ChurchOwnerGuard)
  @UseInterceptors(TransactionInterceptor)
  patchChurchJoinCode(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: UpdateChurchJoinCodeDto,
    @QueryRunner() qr: QR,
  ) {
    return this.churchesService.updateChurchJoinCode(
      churchId,
      dto.joinCode,
      qr,
    );
  }

  @ApiOperation({
    summary: '교회 생성자(owner) 양도',
  })
  @Patch(':churchId/owner')
  @UseGuards(AccessTokenGuard, ChurchOwnerGuard)
  @UseInterceptors(TransactionInterceptor)
  transferMainAdmin(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @Body() dto: TransferOwnerDto,
    @QueryRunner() qr: QR,
  ) {
    const ownerUserId = accessPayload.id;

    return this.churchesService.transferOwner(churchId, ownerUserId, dto, qr);
  }

  @ApiOperation({
    summary: '교인 수 새로고침',
  })
  @Patch(':churchId/refresh-member-count')
  @UseGuards(AccessTokenGuard, ChurchOwnerGuard)
  refreshMemberCount(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.churchesService.refreshMemberCount(churchId);
  }
}
