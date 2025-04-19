import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guard/jwt.guard';
import { Token } from '../auth/decorator/jwt.decorator';
import { AuthType } from '../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../auth/type/jwt';
import {
  ApiCancelMyJoinRequest,
  ApiGetMyJoinRequest,
  ApiGetMyPendingJoinRequest,
  ApiGetUser,
} from './const/swagger/user.controller.swagger';

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
}
