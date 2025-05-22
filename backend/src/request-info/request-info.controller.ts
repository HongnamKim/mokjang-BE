import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { RequestInfoService } from './service/request-info.service';
import { CreateRequestInfoDto } from './dto/create-request-info.dto';
import { ApiTags } from '@nestjs/swagger';
import { ValidateRequestInfoDto } from './dto/validate-request-info.dto';
import { QueryRunner as QR } from 'typeorm';
import { GetRequestInfoDto } from './dto/get-request-info.dto';
import { SubmitRequestInfoDto } from './dto/submit-request-info.dto';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { DefaultFamilyRelationPipe } from '../family-relation/pipe/default-family-relation-pipe.service';
import { QueryRunner } from '../common/decorator/query-runner.decorator';

@ApiTags('Churches:Request-Info')
@Controller('churches/:churchId/request')
export class RequestInfoController {
  constructor(private readonly requestInfoService: RequestInfoService) {}

  @Get()
  getRequestInfos(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetRequestInfoDto,
  ) {
    return this.requestInfoService.findAllRequestInfos(churchId, dto);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postRequestInfo(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query('isTest') isTest: boolean,
    @Body(DefaultFamilyRelationPipe) dto: CreateRequestInfoDto,
    @QueryRunner() qr: QR,
  ) {
    const requestInfo = await this.requestInfoService.createRequestInfo(
      churchId,
      dto,
      qr,
    );

    const message = this.requestInfoService.sendRequestInfoUrlMessage(
      requestInfo,
      isTest,
    );

    if (isTest) {
      return message;
    } else {
      return '초대 메시지 전송 완료';
    }
  }

  @Delete(':requestInfoId')
  deleteInvitation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('requestInfoId', ParseIntPipe) requestInfoId: number,
  ) {
    return this.requestInfoService.deleteRequestInfoById(
      churchId,
      requestInfoId,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post(':requestInfoId/validation')
  validateInvitation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('requestInfoId', ParseIntPipe) requestInfoId: number,
    @Body() dto: ValidateRequestInfoDto,
  ) {
    return this.requestInfoService.validateRequestInfo(
      churchId,
      requestInfoId,
      dto,
    );
  }

  @Post(':requestInfoId/submit')
  @UseInterceptors(TransactionInterceptor)
  submitRequestInfo(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('requestInfoId', ParseIntPipe) requestInfoId: number,
    @Body() dto: SubmitRequestInfoDto,
    @QueryRunner() qr: QR,
  ) {
    return this.requestInfoService.submitRequestInfo(
      churchId,
      requestInfoId,
      dto,
      qr,
    );
  }
}
