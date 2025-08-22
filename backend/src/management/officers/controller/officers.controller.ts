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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOfficerDto } from '../dto/request/create-officer.dto';
import { UpdateOfficerNameDto } from '../dto/request/update-officer-name.dto';
import { OfficersService } from '../service/officers.service';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import {
  ApiDeleteOfficer,
  ApiGetOfficers,
  ApiPatchOfficerName,
  ApiPatchOfficerStructure,
  ApiPostOfficer,
  ApiRefreshOfficerCount,
} from '../const/swagger/officers.swagger';
import { GetOfficersDto } from '../dto/request/get-officers.dto';
import { OfficerWriteGuard } from '../guard/officer-write.guard';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../permission/guard/church-manager.guard';
import { UpdateOfficerStructureDto } from '../dto/request/update-officer-structure.dto';
import { RequestChurch } from '../../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetUnassignedMembersDto } from '../../ministries/dto/ministry-group/request/member/get-unassigned-members.dto';

@ApiTags('Management:Officers')
@Controller('officers')
export class OfficersController {
  constructor(private readonly officersService: OfficersService) {}

  @ApiGetOfficers()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @Get()
  getOfficers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetOfficersDto,
  ) {
    return this.officersService.getOfficers(churchId, dto);
  }

  @ApiPostOfficer()
  @OfficerWriteGuard()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateOfficerDto,
    @QueryRunner() qr: QR,
  ) {
    return this.officersService.createOfficer(churchId, dto, qr);
  }

  @ApiRefreshOfficerCount()
  @Patch('refresh-count')
  @OfficerWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  refreshOfficerCount(
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.officersService.refreshOfficerCount(church, qr);
  }

  @ApiOperation({ summary: '직분을 가지지 않은 교인 조회' })
  @Get('unassigned-member')
  getUnassignedMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetUnassignedMembersDto,
  ) {
    return this.officersService.getUnassignedMembers(churchId, dto);
  }

  @ApiDeleteOfficer()
  @OfficerWriteGuard()
  @Delete(':officerId')
  @UseInterceptors(TransactionInterceptor)
  deleteOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('officerId', ParseIntPipe) officerId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.officersService.deleteOfficer(churchId, officerId, qr);
  }

  @ApiPatchOfficerName()
  @OfficerWriteGuard()
  @Patch(':officerId/name')
  @UseInterceptors(TransactionInterceptor)
  patchOfficer(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('officerId', ParseIntPipe) officerId: number,
    @Body() dto: UpdateOfficerNameDto,
    @QueryRunner() qr: QR,
  ) {
    return this.officersService.updateOfficerName(churchId, officerId, dto, qr);
  }

  @ApiPatchOfficerStructure()
  @OfficerWriteGuard()
  @Patch(':officerId/structure')
  @UseInterceptors(TransactionInterceptor)
  patchOfficerStructure(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('officerId', ParseIntPipe) officerId: number,
    @Body() dto: UpdateOfficerStructureDto,
    @QueryRunner() qr: QR,
  ) {
    return this.officersService.updateOfficerStructure(
      churchId,
      officerId,
      dto,
      qr,
    );
  }
}
