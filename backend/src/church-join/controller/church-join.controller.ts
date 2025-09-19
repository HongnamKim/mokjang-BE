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
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { Token } from '../../auth/decorator/jwt.decorator';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApproveJoinRequestDto } from '../dto/request/approve-join-request.dto';
import { ChurchJoinService } from '../service/church-join.service';
import { CreateJoinRequestDto } from '../dto/request/create-join-request.dto';
import { GetJoinRequestDto } from '../dto/request/get-join-request.dto';
import { GetRecommendLinkMemberDto } from '../../members/dto/request/get-recommend-link-member.dto';
import {
  ApiApproveChurchJoinRequest,
  ApiDeleteChurchJoinRequest,
  ApiGetChurchJoinRequest,
  ApiGetTopRequestUsers,
  ApiPostChurchJoinRequest,
  ApiRejectChurchJoinRequest,
} from '../const/swagger/church-join.swagger';
import { ChurchJoinReadGuard } from '../guard/church-join-read.guard';
import { ChurchJoinWriteGuard } from '../guard/church-join-write.guard';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';

@ApiTags('Churches:Join')
@Controller('churches')
export class ChurchJoinController {
  constructor(private readonly churchJoinRequestService: ChurchJoinService) {}

  @ApiOperation({ summary: '가입코드로 교회 검색' })
  @Get('join/search')
  @ApiQuery({ name: 'joinCode' })
  @UseGuards(AccessTokenGuard)
  getChurchByJoinCode(@Query('joinCode') joinCodeInput: string) {
    const joinCode = joinCodeInput.toUpperCase();

    return this.churchJoinRequestService.getChurchByJoinCode(joinCode);
  }

  @ApiPostChurchJoinRequest()
  @Post('join')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  postChurchJoinRequest(
    @Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @Body() dto: CreateJoinRequestDto,
    @QueryRunner() qr: QR,
  ) {
    return this.churchJoinRequestService.postChurchJoinRequest(
      accessPayload,
      dto.joinCode,
      qr,
    );
  }

  @ApiGetChurchJoinRequest()
  @Get(':churchId/join')
  @ChurchJoinReadGuard()
  getChurchJoinRequests(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetJoinRequestDto,
  ) {
    return this.churchJoinRequestService.getChurchJoinRequests(church, dto);
  }

  @Get(':churchId/join/recommend-link-member')
  @ChurchJoinWriteGuard()
  getRecommendLinkMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetRecommendLinkMemberDto,
  ) {
    return this.churchJoinRequestService.getRecommendLinkMember(church, dto);
  }

  @ApiApproveChurchJoinRequest()
  @Patch(':churchId/join/:joinId/approve')
  @ChurchJoinWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  approveChurchJoinRequest(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('joinId', ParseIntPipe) joinId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: ApproveJoinRequestDto,
    @QueryRunner() qr: QR,
  ) {
    return this.churchJoinRequestService.approveChurchJoinRequest(
      church,
      joinId,
      dto,
      qr,
    );
  }

  @ApiRejectChurchJoinRequest()
  @Patch(':churchId/join/:joinId/reject')
  @ChurchJoinWriteGuard()
  rejectChurchJoinRequest(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('joinId', ParseIntPipe) joinId: number,
    @RequestChurch() church: ChurchModel,
  ) {
    return this.churchJoinRequestService.rejectChurchJoinRequest(
      church,
      joinId,
    );
  }

  @ApiDeleteChurchJoinRequest()
  @Delete(':churchId/join/:joinId')
  @ChurchJoinWriteGuard()
  deleteChurchJoinRequest(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('joinId', ParseIntPipe) joinId: number,
    @RequestChurch() church: ChurchModel,
  ) {
    return this.churchJoinRequestService.deleteChurchJoinRequest(
      church,
      joinId,
    );
  }

  @ApiGetTopRequestUsers()
  @Get(':churchId/join/stats')
  getTopRequestUsers() {
    return this.churchJoinRequestService.getTopRequestUsers();
  }
}
