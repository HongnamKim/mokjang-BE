import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorshipService } from '../service/worship.service';

@ApiTags('Worships')
@Controller()
export class WorshipController {
  constructor(private readonly worshipService: WorshipService) {}

  @Get()
  getWorships() {}

  @Post()
  postWorship(@Body() body: any) {}

  @Get(':worshipId')
  getWorshipById(@Param('worshipId') worshipId: number) {}

  @Patch(':worshipId')
  patchWorshipById(@Param('worshipId') worshipId: number) {}

  @Delete(':worshipId')
  DeleteWorshipById(@Param('worshipId') worshipId: number) {}
}
