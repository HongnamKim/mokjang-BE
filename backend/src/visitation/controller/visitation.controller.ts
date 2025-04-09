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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VisitationService } from '../visitation.service';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { CreateVisitationDto } from '../dto/create-visitation.dto';
import { ChurchManagerGuard } from '../../churches/guard/church-manager-guard.service';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { Token } from '../../auth/decorator/jwt.decorator';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { GetVisitationDto } from '../dto/get-visitation.dto';
import {
  ApiGetVisitations,
  ApiPostVisitation,
} from '../decorator/visitation.swagger';
import { UpdateVisitationDto } from '../dto/update-visitation.dto';

@ApiTags('Visitations')
@Controller('visitations')
export class VisitationController {
  constructor(private readonly visitationService: VisitationService) {}

  @ApiGetVisitations()
  @Get()
  getVisitations(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetVisitationDto,
  ) {
    return this.visitationService.getVisitations(churchId, dto);
  }

  @ApiPostVisitation()
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
    summary: '특정 심방 상세 내용 조회 (메타 + 세부)',
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
    description:
      '<h2>심방의 메타 데이터를 수정합니다.</h2>' +
      '<h3>수정 가능 요소</h3>' +
      '<p>1. 심방 상태 (에약 / 완료 / 지연)</p>' +
      '<p>2. 심방 방식 (대면 / 비대면)</p>' +
      '<p>3. 심방 제목</p>' +
      '<p>4. 심방 진행자</p>' +
      '<p>5. 심방 진행 날짜</p>',
  })
  @Patch(':visitationId')
  @UseInterceptors(TransactionInterceptor)
  patchVisitationMetaData(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationMetaDataId: number,
    @Body() dto: UpdateVisitationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.updateVisitationMetaData(
      churchId,
      visitationMetaDataId,
      dto,
      qr,
    );
  }

  @ApiOperation({
    summary: '심방 삭제 (메타 + 세부)',
  })
  @Delete(':visitationId')
  @UseInterceptors(TransactionInterceptor)
  deleteVisiting(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.visitationService.deleteVisitation(churchId, visitationId, qr);
  }
}
