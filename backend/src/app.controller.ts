import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { DummyDataService } from './dummy-data.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dummyDataService: DummyDataService,
  ) {}

  @Get()
  getHello() {
    return this.appService.healthCheck();
  }

  @ApiOperation({
    summary: '더미 교인 생성',
    description:
      '<h2>더미 교인 데이터 20개를 생성합니다.</h2>' +
      '<p>직분, 사역, 그룹, 교육 등은 부여되지 않은 개인정보만 담고 있습니다.</p>' +
      '<p>여러번 생성 가능합니다.</p>',
  })
  @Post('dummy/:churchId/members')
  postDummyMembers(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.dummyDataService.createRandomMembers(churchId, 20);
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
