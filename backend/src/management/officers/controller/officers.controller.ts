import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOfficerDto } from '../dto/create-officer.dto';
import { UpdateOfficerDto } from '../dto/update-officer.dto';
import { OfficersService } from '../service/officers.service';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import {
  ApiDeleteOfficer,
  ApiGetOfficers,
  ApiPatchOfficer,
  ApiPostOfficer,
} from '../const/swagger/officers.swagger';
import { GetOfficersDto } from '../dto/request/get-officers.dto';

@ApiTags('Management:Officers')
@Controller('officers')
export class OfficersController {
  constructor(private readonly officersService: OfficersService) {}

  @ApiGetOfficers()
  @Get()
  getOfficers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetOfficersDto,
  ) {
    return this.officersService.getOfficers(churchId, dto);
  }

  @ApiPostOfficer()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateOfficerDto,
    @QueryRunner() qr: QR,
  ) {
    return this.officersService.createOfficer(churchId, dto, qr);
  }

  @ApiPatchOfficer()
  @Patch(':officerId')
  @UseInterceptors(TransactionInterceptor)
  patchOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('officerId', ParseIntPipe) officerId: number,
    @Body() dto: UpdateOfficerDto,
    @QueryRunner() qr: QR,
  ) {
    return this.officersService.updateOfficer(churchId, officerId, dto, qr);
  }

  @ApiDeleteOfficer()
  @Delete(':officerId')
  @UseInterceptors(TransactionInterceptor)
  deleteOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('officerId', ParseIntPipe) officerId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.officersService.deleteOfficer(churchId, officerId, qr);
  }
}
