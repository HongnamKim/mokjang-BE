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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VisitationService } from './visitation.service';
import { UpdateVisitationMetaDto } from './dto/meta/update-visitation-meta.dto';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { CreateVisitationDto } from './dto/create-visitation.dto';
import { ChurchManagerGuard } from '../churches/guard/church-manager-guard.service';
import { AccessTokenGuard } from '../auth/guard/jwt.guard';
import { Token } from '../auth/decorator/jwt.decorator';
import { AuthType } from '../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../auth/type/jwt';

@ApiTags('Visitations')
@Controller('visitations')
export class VisitationController {
  constructor(private readonly visitationService: VisitationService) {}

  @ApiOperation({
    summary: '교회의 심방 목록 조회',
  })
  @Get()
  getVisitations(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.visitationService.getVisitations(churchId);
  }

  @ApiOperation({
    summary: '심방 생성 (인증 필요)',
    description:
      '<p>심방을 생성합니다.</p>' +
      '<p>심방의 예약과 기록은 VisitationStatus 로 구분합니다.</p>' +
      '<p>예약 생성 시 --> VisitationStatus: RESERVE</p>' +
      '<p>기록 생성 시 --> VisitationStatus: DONE</p>',
  })
  @Post()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @UseInterceptors(TransactionInterceptor)
  postVisitationReservation(
    @Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @Param('churchId', ParseIntPipe)
    churchId: number,
    @Body() dto: CreateVisitationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.createVisitation(
      accessPayload,
      churchId,
      dto,
      qr,
    );
  }

  @ApiOperation({
    summary: '특정 심방 상세 내용 조회',
  })
  @Get(':visitationId')
  @UseInterceptors(TransactionInterceptor)
  getVisitingById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationMetaDataId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.getVisitationById(
      churchId,
      visitationMetaDataId,
      qr,
    );
  }

  @ApiOperation({
    summary: '심방의 메타 데이터 수정',
  })
  @Patch(':visitationId')
  patchVisitationMetaData(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationMetaDataId: number,
    @Body() dto: UpdateVisitationMetaDto,
  ) {
    return this.visitationService.updateVisitingMetaData(
      churchId,
      visitationMetaDataId,
      dto,
    );
  }

  @ApiOperation({
    summary: '심방 삭제 (메타 + 세부)',
  })
  @Delete(':visitationId')
  deleteVisiting(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
  ) {
    return visitationId;
  }

  @ApiOperation({
    summary: '심방 세부 내용 작성',
  })
  @Patch(':visitationId/details/:detailId')
  patchVisitationDetail(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @Param('detailId', ParseIntPipe) detailId: number,
  ) {
    return `${churchId} ${visitationId} ${detailId}`;
  }

  @ApiOperation({
    summary: '심방 세부 내용 삭제',
  })
  @Delete(':visitationId/details/:detailId')
  deleteVisitationDetail(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @Param('detailId', ParseIntPipe) detailId: number,
  ) {}
}
