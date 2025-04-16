import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guard/jwt.guard';
import { Token } from '../auth/decorator/jwt.decorator';
import { AuthType } from '../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../auth/type/jwt';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { LinkMemberToUserDto } from './dto/link-member-to-user.dto';
import { ChurchMemberGuard } from '../churches/guard/church-manager-guard.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: '내 회원 정보 불러오기',
  })
  @Get()
  @UseGuards(AccessTokenGuard)
  getUser(@Token(AuthType.ACCESS) accessToken: JwtAccessPayload) {
    return this.userService.getUserById(accessToken.id);
  }

  @ApiOperation({
    summary: '교회 가입 신청 내역 조회',
    description: '내가 신청한 교회 가입 내역을 조회합니다. (최근 10개)',
  })
  @Get('join-request')
  @UseGuards(AccessTokenGuard)
  getMyJoinRequest(@Token(AuthType.ACCESS) accessToken: JwtAccessPayload) {
    return this.userService.getMyJoinRequest(accessToken.id);
  }

  @ApiOperation({
    summary: '교회 가입 신청 취소',
    description:
      '<h2>교회 가입 신청을 취소합니다.</h2>' +
      '<p>PENDING(처리중) 상태인 가입 신청을 취소합니다.</p>',
  })
  @ApiNotFoundResponse({
    description: 'PENDING 상태인 가입 신청 내역이 없을 경우',
  })
  @Patch('join-request/cancel')
  @UseGuards(AccessTokenGuard)
  cancelMyJoinRequest(@Token(AuthType.ACCESS) accessToken: JwtAccessPayload) {
    return this.userService.cancelMyJoinRequest(accessToken.id);
  }

  @ApiOperation({
    deprecated: true,
    summary: '회원 정보와 교인 정보 연결하기',
    description:
      '<h2>내 회원 정보와 소속 교회의 교인 정보를 연결합니다.</h2>' +
      '<p>교회에 소속된 회원만 요청 가능합니다.</p>',
  })
  @Post('link-member')
  @UseGuards(AccessTokenGuard, ChurchMemberGuard)
  @UseInterceptors(TransactionInterceptor)
  linkMemberToUser(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Body() dto: LinkMemberToUserDto,
    @QueryRunner() qr: QR,
  ) {
    /*return this.userService.linkMemberToUser(
      accessToken.id,
      dto.churchId,
      dto.memberId,
      qr,
    );*/
  }
}
