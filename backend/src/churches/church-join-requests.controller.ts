import {
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
import { ChurchesService } from './churches.service';
import {
  ApiAcceptChurchJoinRequest,
  ApiDeleteChurchJoinRequest,
  ApiGetChurchJoinRequest,
  ApiPostChurchJoinRequest,
  ApiRejectChurchJoinRequest,
} from './const/swagger/churches/controller.swagger';
import { AccessTokenGuard } from '../auth/guard/jwt.guard';
import { ChurchManagerGuard } from './guard/church-manager-guard.service';
import { Token } from '../auth/decorator/jwt.decorator';
import { AuthType } from '../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../auth/type/jwt';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Churches:Join Requests')
@Controller(':churchId/join')
export class ChurchJoinRequestsController {
  constructor(private readonly churchesService: ChurchesService) {}

  @ApiGetChurchJoinRequest()
  @Get(':churchId/join')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getChurchJoinRequests(
    @Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @Param('churchId', ParseIntPipe) churchId: number,
  ) {
    return this.churchesService.getChurchJoinRequests(churchId);
  }

  @ApiPostChurchJoinRequest()
  @Post(':churchId/join')
  @UseGuards(AccessTokenGuard)
  postChurchJoinRequest(
    @Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @Param('churchId', ParseIntPipe) churchId: number,
  ) {
    return this.churchesService.postChurchJoinRequest(accessPayload, churchId);
  }

  @ApiAcceptChurchJoinRequest()
  @Patch(':churchId/join/:joinId/accept')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @UseInterceptors(TransactionInterceptor)
  acceptChurchJoinRequest(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('joinId', ParseIntPipe) joinId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.churchesService.acceptChurchJoinRequest(churchId, joinId, qr);
  }

  @ApiRejectChurchJoinRequest()
  @Patch(':churchId/join/:joinId/reject')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  rejectChurchJoinRequest(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('joinId', ParseIntPipe) joinId: number,
  ) {
    return this.churchesService.rejectChurchJoinRequest(churchId, joinId);
  }

  @ApiDeleteChurchJoinRequest()
  @Delete(':churchId/join/:joinId')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  deleteChurchJoinRequest(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('joinId', ParseIntPipe) joinId: number,
  ) {
    return this.churchesService.deleteChurchJoinRequest(churchId, joinId);
  }
}
