import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.healthCheck();
  }

  @ApiOperation({ summary: 'NotFoundException' })
  @Get('error/not-found')
  getNotFoundError() {
    throw new NotFoundException('해당 정보를 찾을 수 없습니다.');
  }

  @ApiOperation({ summary: 'BadRequestException' })
  @Get('error/bad-request')
  getBadRequest() {
    throw new BadRequestException('잘못된 요청입니다.');
  }

  @ApiOperation({ summary: 'UnauthorizedException' })
  @Get('error/unauthorized')
  getUnauthorizedError() {
    throw new UnauthorizedException('회원 인증에 실패하였습니다.');
  }

  @ApiOperation({ summary: 'ForbiddenException' })
  @Get('error/forbidden')
  getForbiddenError() {
    throw new ForbiddenException('권한이 없습니다.');
  }

  @ApiOperation({ summary: 'InternalServerErrorException' })
  @Get('error/internal-server')
  getInternServerError() {
    throw new InternalServerErrorException('데이터 저장 실패');
  }
}
