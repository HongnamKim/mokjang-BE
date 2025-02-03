import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../guard/jwt.guard';
import { AccessToken } from '../decorator/jwt.decorator';
import { JwtAccessPayload } from '../type/jwt';
import { UserService } from '../service/user.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get('user')
  @UseGuards(AccessTokenGuard)
  getUser(@AccessToken() payload: JwtAccessPayload) {
    return this.userService.getUserById(payload.id);
  }
}
