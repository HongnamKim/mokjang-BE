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
import { ApiOperation } from '@nestjs/swagger';
import { Token } from '../../auth/decorator/jwt.decorator';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { UpdateChurchDto } from '../dto/update-church.dto';
import {
  ApiDeleteChurch,
  ApiGetAllChurches,
  ApiGetChurchById,
  ApiPatchChurch,
  ApiPostChurch,
} from '../const/swagger/church.swagger';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateChurchJoinCodeDto } from '../dto/update-church-join-code.dto';
import { TransferOwnerDto } from '../dto/transfer-owner.dto';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { ChurchReadGuard } from '../guard/church-read.guard';
import { ChurchWriteGuard } from '../guard/church-write.guard';

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
  @ChurchReadGuard()
  @UseGuards(AccessTokenGuard)
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getChurchById(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.churchesService.getChurchById(churchId);
  }

  @ApiPatchChurch()
  @ChurchWriteGuard()
  @Patch(':churchId')
  patchChurch(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: UpdateChurchDto,
  ) {
    return this.churchesService.updateChurch(churchId, dto);
  }

  @ApiDeleteChurch()
  @ChurchWriteGuard()
  @Delete(':churchId')
  deleteChurch(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.churchesService.deleteChurchById(churchId);
  }

  @ApiOperation({
    summary: '가입 코드 수정',
  })
  @Patch(':churchId/join-code')
  @ChurchWriteGuard()
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
  @ChurchWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  transferMainAdmin(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: TransferOwnerDto,
    @QueryRunner() qr: QR,
  ) {
    return this.churchesService.transferOwner(churchId, dto, qr);
  }

  @ApiOperation({
    summary: '교인 수 새로고침',
  })
  @ChurchWriteGuard()
  @Patch(':churchId/refresh-member-count')
  refreshMemberCount(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.churchesService.refreshMemberCount(churchId);
  }
}
