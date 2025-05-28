import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { GetManagersDto } from '../dto/request/get-managers.dto';
import { ManagerService } from '../service/manager.service';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { AssignPermissionTemplateDto } from '../dto/request/assign-permission-template.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Churches:Managers')
@Controller('managers')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @ApiOperation({ summary: '관리자 조회' })
  @Get()
  getManagers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetManagersDto,
  ) {
    return this.managerService.getManagers(churchId, dto);
  }

  @ApiOperation({ summary: '관리자 단건 조회' })
  @Get(':managerId')
  getManagerById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('managerId', ParseIntPipe) managerId: number,
  ) {
    return this.managerService.getManagerById(churchId, managerId);
  }

  @ApiOperation({ summary: '관리자 활성 상태 온오프' })
  @Patch(':managerId/toggle-permission-activity')
  @UseInterceptors(TransactionInterceptor)
  toggleManagerPermissionActive(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('managerId', ParseIntPipe) managerId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.managerService.togglePermissionActive(churchId, managerId, qr);
  }

  @ApiOperation({ summary: '권한 유형 부여' })
  @Patch(':managerId/assign-permission-template')
  @UseInterceptors(TransactionInterceptor)
  assignPermissionTemplate(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('managerId', ParseIntPipe) managerId: number,
    @Body() dto: AssignPermissionTemplateDto,
    @QueryRunner() qr: QR,
  ) {
    return this.managerService.assignPermissionTemplate(
      churchId,
      managerId,
      dto,
      qr,
    );
  }

  @ApiOperation({ summary: '권한 유형 해제' })
  @Patch(':managerId/unassign-permission-template')
  @UseInterceptors(TransactionInterceptor)
  unassignPermissionTemplate(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('managerId', ParseIntPipe) managerId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.managerService.unassignPermissionTemplate(
      churchId,
      managerId,
      qr,
    );
  }
}
