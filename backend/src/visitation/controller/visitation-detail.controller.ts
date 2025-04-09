import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { VisitationService } from '../visitation.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateVisitationDetailDto } from '../dto/detail/update-visitation-detail.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { CreateVisitationDetailDto } from '../dto/detail/create-visitation-detail.dto';

@ApiTags('Visitations:Details')
@Controller('visitations/:visitationId/details')
export class VisitationDetailController {
  constructor(private readonly visitationService: VisitationService) {}

  @ApiOperation({
    summary: '심방 대상자 추가',
    description: '심방 메타 데이터 수정에서 대상자를 추가',
    deprecated: true,
  })
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postVisitationDetail(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @Body() dto: CreateVisitationDetailDto,
    @QueryRunner() qr: QR,
  ) {
    /*return this.visitationService.createVisitationDetail(
      churchId,
      visitationId,
      dto,
      qr,
    );*/
  }

  @ApiOperation({
    summary: '심방 세부 내용 작성',
    description: '심방 세부 내용 작성, 심방 대상자 삭제 불가능',
  })
  @Patch(':detailId')
  patchVisitationDetail(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @Param('detailId', ParseIntPipe) detailId: number,
    @Body() dto: UpdateVisitationDetailDto,
  ) {
    return this.visitationService.updateVisitationDetail(
      churchId,
      visitationId,
      detailId,
      dto,
    );
  }

  @ApiOperation({
    summary: '심방 세부 내용 삭제',
    description:
      '심방 메타 데이터 수정에서 심방 대상자를 삭제하여 세부 내용을 삭제',
    deprecated: true,
  })
  @UseInterceptors(TransactionInterceptor)
  @Delete(':detailId')
  deleteVisitationDetail(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @Param('detailId', ParseIntPipe) detailId: number,
    @QueryRunner() qr: QR,
  ) {}
}
