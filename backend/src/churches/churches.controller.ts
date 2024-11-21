import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { CreateChurchDto } from './dto/create-church.dto';

@Controller('churches')
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Get()
  getAllChurches() {
    return this.churchesService.findAll();
  }

  @Get(':id')
  getChurchById(@Param('id', ParseIntPipe) id: number) {
    return this.churchesService.findById(id);
  }

  @Post()
  postChurch(@Body() dto: CreateChurchDto) {
    return this.churchesService.createChurch(dto);
  }

  @Delete(':id')
  deleteChurch(@Param('id', ParseIntPipe) id: number) {
    return this.churchesService.deleteChurchById(id);
  }
}
