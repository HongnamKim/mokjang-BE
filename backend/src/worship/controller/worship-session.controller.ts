import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorshipSessionService } from '../service/worship-session.service';

@ApiTags('Worships:Sessions')
@Controller(':worshipId/sessions')
export class WorshipSessionController {
  constructor(private readonly worshipSessionService: WorshipSessionService) {}

  @Get()
  getSessions() {}

  @Post()
  postSession() {}

  @Get(':sessionId')
  getSessionById(
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {}
}
