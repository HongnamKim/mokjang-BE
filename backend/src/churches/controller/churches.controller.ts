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
import { TrialChurchesService } from '../service/trial-churches.service';
import { ChurchOwnerGuard } from '../../permission/guard/church-owner.guard';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../entity/church.entity';
import { UserGuard } from '../../user/guard/user.guard';
import { User } from '../../user/decorator/user.decorator';
import { UserModel } from '../../user/entity/user.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { RequestOwner } from '../../permission/decorator/request-owner.decorator';

@Controller('churches')
export class ChurchesController {
  constructor(
    private readonly churchesService: ChurchesService,
    private readonly trialChurchesService: TrialChurchesService,
  ) {}

  // 전체 교회 조회
  @ApiGetAllChurches()
  @Get()
  getAllChurches() {
    return this.churchesService.findAllChurches();
  }

  // 교회 생성
  @ApiPostChurch()
  @Post()
  @UseGuards(AccessTokenGuard, UserGuard)
  @UseInterceptors(TransactionInterceptor)
  postChurch(
    @User() user: UserModel,
    @Body() dto: CreateChurchDto,
    @QueryRunner() qr: QR,
  ) {
    return this.churchesService.createChurch(user, dto, qr);
  }

  @ApiOperation({
    deprecated: true,
    summary: '무료 체험 시작',
    description:
      '<p>더미 교인 30명 생성</p>' +
      '<p>더미 그룹 - 장년부, 남선교회, 여선교회, 교회학교</p>',
  })
  @Post('trial')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  postTrialChurch(
    @Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @QueryRunner() qr: QR,
  ) {
    throw new GoneException();
    //return this.trialChurchesService.startTrialChurch(accessPayload.id, qr);
  }

  @ApiOperation({
    summary: '테스트용',
  })
  @Delete('trial-end-test')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  deleteTrailChurch(
    @Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @QueryRunner() qr: QR,
  ) {
    return this.trialChurchesService.endTrialChurch(accessPayload.id, qr);
  }

  // 교회 단건 조회
  @ApiGetChurchById()
  @Get(':churchId')
  @ChurchReadGuard()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getChurchById(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.churchesService.getChurchById(churchId);
  }

  // 교회 수정
  @ApiPatchChurch()
  @ChurchWriteGuard()
  @Patch(':churchId')
  patchChurch(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @RequestOwner() requestOwner: ChurchUserModel,
    @Body() dto: UpdateChurchDto,
  ) {
    return this.churchesService.updateChurch(requestOwner, church, dto);
  }

  // 교회 삭제
  @ApiDeleteChurch()
  @ChurchWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  @Delete(':churchId')
  deleteChurch(
    @User() user: UserModel,
    @RequestChurch() church: ChurchModel,
    @Param('churchId', ParseIntPipe) churchId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.churchesService.deleteChurchById(church, user, qr);
  }

  @ApiOperation({
    summary: '교회 구독 정보 조회',
  })
  @Get(':churchId/subscription')
  @UseGuards(AccessTokenGuard, ChurchOwnerGuard)
  getChurchSubscription(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
  ) {
    return this.churchesService.getChurchSubscription(church);
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
