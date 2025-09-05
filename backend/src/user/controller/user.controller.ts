import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { Token } from '../../auth/decorator/jwt.decorator';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../../auth/type/jwt';
import {
  ApiCancelMyJoinRequest,
  ApiGetMyJoinRequest,
  ApiGetMyPendingJoinRequest,
  ApiGetUser,
  ApiPatchUser,
} from '../const/swagger/user.swagger';
import { UserGuard } from '../guard/user.guard';
import { User } from '../decorator/user.decorator';
import { UserModel } from '../entity/user.entity';
import { UseTransaction } from '../../common/decorator/use-transaction.decorator';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateUserInfoDto } from '../dto/request/update-user-info.dto';
import { UpdateUserMobilePhoneDto } from '../dto/request/update-user-mobile-phone.dto';
import { VerifyUserMobilePhoneDto } from '../dto/request/verify-user-mobile-phone.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiGetUser()
  @Get()
  @UseGuards(AccessTokenGuard)
  getUser(@Token(AuthType.ACCESS) accessToken: JwtAccessPayload) {
    return this.userService.getUserById(accessToken.id);
  }

  @ApiPatchUser()
  @Patch()
  @UseGuards(AccessTokenGuard, UserGuard)
  patchUser(@User() user: UserModel, @Body() dto: UpdateUserInfoDto) {
    return this.userService.updateUserInfo(user, dto);
  }

  @ApiOperation({ summary: '번호 수정을 위한 인증 요청' })
  @Post('verification/request')
  @UseGuards(AccessTokenGuard, UserGuard)
  @UseTransaction()
  requestMobileVerification(
    @User() user: UserModel,
    @Body() dto: UpdateUserMobilePhoneDto,
    @QueryRunner() qr: QR,
  ) {
    return this.userService.updateUserMobilePhone(user, dto, qr);
  }

  @ApiOperation({ summary: '인증 확인 및 번호 수정' })
  @Post('verification/verify')
  @UseGuards(AccessTokenGuard, UserGuard)
  @UseTransaction()
  verifyMobileVerification(
    @User() user: UserModel,
    @Body() dto: VerifyUserMobilePhoneDto,
    @QueryRunner() qr: QR,
  ) {
    return this.userService.verifyMobilePhone(user, dto, qr);
  }

  @ApiGetMyJoinRequest()
  @Get('church/join-request')
  @UseGuards(AccessTokenGuard)
  getMyJoinRequest(@Token(AuthType.ACCESS) accessToken: JwtAccessPayload) {
    return this.userService.getMyJoinRequest(accessToken.id);
  }

  @ApiGetMyPendingJoinRequest()
  @Get('church/join-request/pending')
  @UseGuards(AccessTokenGuard)
  getMyPendingJoinRequest(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
  ) {
    return this.userService.getMyPendingJoinRequest(accessToken.id);
  }

  @ApiCancelMyJoinRequest()
  @Patch('church/join-request/cancel')
  @UseGuards(AccessTokenGuard)
  cancelMyJoinRequest(@Token(AuthType.ACCESS) accessToken: JwtAccessPayload) {
    return this.userService.cancelMyJoinRequest(accessToken.id);
  }

  @Patch('church/leave')
  @UseTransaction()
  @UseGuards(AccessTokenGuard, UserGuard)
  leaveChurch(@User() user: UserModel, @QueryRunner() qr: QR) {
    return this.userService.leaveChurch(user, qr);
  }
}
