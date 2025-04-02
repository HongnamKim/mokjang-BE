import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guard/jwt.guard';
import { Token } from '../auth/decorator/jwt.decorator';
import { AuthType } from '../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../auth/type/jwt';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { LinkMemberToUserDto } from './dto/link-member-to-user.dto';
import { SignInChurchDto } from './dto/sign-in-church.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  getUser(@Token(AuthType.ACCESS) accessToken: JwtAccessPayload) {
    return this.userService.getUserById(accessToken.id);
  }

  @Post('sign-in-church')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  signInChurch(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Body() dto: SignInChurchDto,
    @QueryRunner() qr: QR,
  ) {
    return this.userService.signInChurch(accessToken.id, dto.churchId, qr);
  }

  @Post('link-member')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  linkMemberToUser(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Body() dto: LinkMemberToUserDto,
    @QueryRunner() qr: QR,
  ) {
    return this.userService.linkMemberToUser(
      accessToken.id,
      dto.churchId,
      dto.memberId,
      qr,
    );
  }
}
