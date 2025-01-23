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
import { CreateOfficerDto } from '../../dto/officer/create-officer.dto';
import { UpdateOfficerDto } from '../../dto/officer/update-officer.dto';
import { OfficersService } from '../../service/officer/officers.service';

@ApiTags('Settings:Officers')
@Controller('officers')
export class OfficersController {
  constructor(private readonly officersService: OfficersService) {}

  @Get()
  getOfficers(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.officersService.getOfficers(churchId);
  }

  @Post()
  postOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateOfficerDto,
  ) {
    return this.officersService.postOfficer(churchId, dto);
  }

  @Patch(':officerId')
  patchOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('officerId', ParseIntPipe) officerId: number,
    @Body() dto: UpdateOfficerDto,
  ) {
    return this.officersService.updateOfficer(churchId, officerId, dto);
  }

  @Delete(':officerId')
  deleteOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('officerId', ParseIntPipe) officerId: number,
  ) {
    return this.officersService.deleteOfficer(churchId, officerId);
  }
}
