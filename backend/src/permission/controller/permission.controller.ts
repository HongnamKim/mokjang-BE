import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PermissionService } from '../service/permission.service';
import { DomainType } from '../const/domain-type.enum';
import { ApiTags } from '@nestjs/swagger';
import { GetPermissionTemplateDto } from '../dto/template/request/get-permission-template.dto';
import { CreatePermissionTemplateDto } from '../dto/template/request/create-permission-template.dto';
import { UpdatePermissionTemplateDto } from '../dto/template/request/update-permission-template.dto';
import {
  ApiDeletePermissionTemplate,
  ApiGetManagersByPermissionTemplate,
  ApiGetPermissionTemplateById,
  ApiGetPermissionTemplates,
  ApiGetPermissionUnits,
  ApiPatchPermissionTemplate,
  ApiPostPermissionTemplates,
  ApiPostSamplePermissionTemplates,
} from '../swagger/permission.swagger';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { GetManagersByPermissionTemplateDto } from '../dto/template/request/get-managers-by-permission-template.dto';
import { PermissionReadGuard } from '../guard/permission-read.guard';
import { PermissionWriteGuard } from '../guard/permission-write.guard';
import { ChurchManagerGuard } from '../guard/church-manager.guard';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { RequestChurch } from '../decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { RequestManager } from '../decorator/request-manager.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

@ApiTags('Churches:Permissions')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiGetPermissionUnits()
  @Get('units')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getPermissionUnits(
    @Param('churchId', ParseIntPipe) _: number,
    @Query('domain', new ParseEnumPipe(DomainType, { optional: true }))
    domain?: DomainType,
  ) {
    return this.permissionService.getPermissionUnits(domain);
  }

  @ApiGetPermissionTemplates()
  @Get('templates')
  @PermissionReadGuard()
  getPermissionTemplates(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetPermissionTemplateDto,
  ) {
    return this.permissionService.getPermissionTemplates(church, dto);
  }

  @ApiPostPermissionTemplates()
  @Post('templates')
  @PermissionWriteGuard()
  postPermissionTemplates(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: CreatePermissionTemplateDto,
  ) {
    return this.permissionService.postPermissionTemplates(church, dto);
  }

  @ApiPostSamplePermissionTemplates()
  @Post('templates/sample')
  @PermissionWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postSamplePermissionTemplates(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.permissionService.postSamplePermissionTemplates(church, qr);
  }

  @ApiGetPermissionTemplateById()
  @Get('templates/:templateId')
  @PermissionReadGuard()
  getPermissionTemplateById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Param('templateId', ParseIntPipe) templateId: number,
  ) {
    return this.permissionService.getPermissionTemplateById(church, templateId);
  }

  @ApiGetManagersByPermissionTemplate()
  @Get('templates/:templateId/managers')
  @PermissionReadGuard()
  getManagersByPermissionTemplate(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Param('templateId', ParseIntPipe) templateId: number,
    @Query() dto: GetManagersByPermissionTemplateDto,
  ) {
    return this.permissionService.getManagersByPermissionTemplate(
      church,
      templateId,
      dto,
    );
  }

  @ApiPatchPermissionTemplate()
  @Patch('templates/:templateId')
  @PermissionWriteGuard()
  patchPermissionTemplate(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() dto: UpdatePermissionTemplateDto,
    @RequestManager() requestManager: ChurchUserModel,
  ) {
    return this.permissionService.patchPermissionTemplate(
      church,
      requestManager,
      templateId,
      dto,
    );
  }

  @ApiDeletePermissionTemplate()
  @Delete('templates/:templateId')
  @PermissionWriteGuard()
  deletePermissionTemplate(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Param('templateId', ParseIntPipe) templateId: number,
  ) {
    return this.permissionService.deletePermissionTemplate(church, templateId);
  }
}
