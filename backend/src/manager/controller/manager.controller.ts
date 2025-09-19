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
import { UpdatePermissionScopeDto } from '../dto/request/update-permission-scope.dto';
import { ManagerReadGuard } from '../guard/manager-read.guard';
import { ManagerWriteGuard } from '../guard/manager-write.guard';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { RequestManager } from '../../permission/decorator/request-manager.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

@ApiTags('Churches:Managers')
@Controller('managers')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @ApiOperation({ summary: '관리자 조회' })
  @Get()
  @ManagerReadGuard()
  getManagers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetManagersDto,
  ) {
    return this.managerService.getManagers(church, dto);
  }

  @ApiOperation({ summary: '관리자 단건 조회' })
  @ManagerReadGuard()
  @Get(':churchUserId')
  getManagerById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('churchUserId', ParseIntPipe) churchUserId: number,
    @RequestChurch() church: ChurchModel,
  ) {
    return this.managerService.getManagerById(church, churchUserId);
  }

  @ApiOperation({ summary: '관리자 활성 상태 온오프' })
  @Patch(':churchUserId/toggle-permission-activity')
  @ManagerWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  toggleManagerPermissionActive(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('churchUserId', ParseIntPipe) churchUserId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @QueryRunner() qr: QR,
  ) {
    return this.managerService.togglePermissionActive(
      church,
      requestManager,
      churchUserId,
      qr,
    );
  }

  @ApiOperation({ summary: '권한 유형 부여' })
  @Patch(':churchUserId/assign-permission-template')
  @ManagerWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  assignPermissionTemplate(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('churchUserId', ParseIntPipe) churchUserId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Body() dto: AssignPermissionTemplateDto,
    @QueryRunner() qr: QR,
  ) {
    return this.managerService.assignPermissionTemplate(
      church,
      requestManager,
      churchUserId,
      dto,
      qr,
    );
  }

  @ApiOperation({ summary: '권한 유형 해제' })
  @Patch(':churchUserId/unassign-permission-template')
  @ManagerWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  unassignPermissionTemplate(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('churchUserId', ParseIntPipe) churchUserId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @QueryRunner() qr: QR,
  ) {
    return this.managerService.unassignPermissionTemplate(
      church,
      requestManager,
      churchUserId,
      qr,
    );
  }

  @ApiOperation({ summary: '권한 범위 수정' })
  @Patch(':churchUserId/permission-scope')
  @ManagerWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchPermissionScope(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('churchUserId', ParseIntPipe) churchUserId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Body() dto: UpdatePermissionScopeDto,
    @QueryRunner() qr: QR,
  ) {
    return this.managerService.patchPermissionScope(
      church,
      requestManager,
      churchUserId,
      dto,
      qr,
    );
  }
}
