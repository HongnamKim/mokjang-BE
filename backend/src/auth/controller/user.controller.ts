import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../guard/jwt.guard';
import { Token } from '../decorator/jwt.decorator';
import { UserService } from '../service/user.service';
import { ApiGetUser } from '../const/swagger/user/controller.swagger';
import { AuthType } from '../const/enum/auth-type.enum';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiGetUser()
  @Get('user')
  @UseGuards(AccessTokenGuard)
  getUser(@Token(AuthType.ACCESS) payload: any) {
    return this.userService.getUserById(payload.id);
  }
}
