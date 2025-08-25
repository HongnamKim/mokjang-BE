import { Controller, Get, UseGuards } from '@nestjs/common';
import { MyPageService } from '../service/my-page.service';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { Token } from '../../auth/decorator/jwt.decorator';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../../auth/type/jwt';

@Controller()
export class MyPageController {
  constructor(private readonly myPageService: MyPageService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  getMe(@Token(AuthType.ACCESS) accessToken: JwtAccessPayload) {
    return this.myPageService.getMe(accessToken.id);
  }
}
