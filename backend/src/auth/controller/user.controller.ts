import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccessTokenGuardV2 } from '../guard/jwt.guard';
import { AccessToken } from '../decorator/jwt.decorator';
import { JwtAccessPayload } from '../type/jwt';
import { UserService } from '../service/user.service';
import { ApiGetUser } from '../const/swagger/user/controller.swagger';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiGetUser()
  //@ApiBearerAuth()
  @Get('user')
  @UseGuards(AccessTokenGuardV2)
  getUser(@AccessToken() payload: JwtAccessPayload) {
    return this.userService.getUserById(payload.id);
  }
}
