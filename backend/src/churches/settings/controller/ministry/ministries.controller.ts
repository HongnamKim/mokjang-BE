import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MinistryService } from '../../service/ministry/ministry.service';
import { CreateMinistryDto } from '../../dto/ministry/create-ministry.dto';
import { UpdateMinistryDto } from '../../dto/ministry/update-ministry.dto';

@ApiTags('Management:Ministries')
@Controller('ministries')
export class MinistriesController {
  constructor(private readonly ministryService: MinistryService) {}

  @Get()
  getMinistries(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.ministryService.getMinistries(churchId);
  }

  @Post()
  postMinistries(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateMinistryDto,
  ) {
    return this.ministryService.createMinistry(churchId, dto);
  }

  @Get(':ministryId')
  getMinistryById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
  ) {
    return this.ministryService.getMinistryById(ministryId);
  }

  @Patch(':ministryId')
  patchMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
    @Body() dto: UpdateMinistryDto,
  ) {
    return this.ministryService.updateMinistry(churchId, ministryId, dto);
  }

  @Delete(':ministryId')
  deleteMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
  ) {
    return this.ministryService.deleteMinistry(churchId, ministryId);
  }
}
