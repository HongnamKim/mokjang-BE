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

@ApiTags('Churches:Permissions')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiGetPermissionUnits()
  @Get('units')
  getPermissionUnits(
    @Param('churchId', ParseIntPipe) _: number,
    @Query('domain', new ParseEnumPipe(DomainType, { optional: true }))
    domain?: DomainType,
  ) {
    return this.permissionService.getPermissionUnits(domain);
  }

  @ApiGetPermissionTemplates()
  @Get('templates')
  getPermissionTemplates(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetPermissionTemplateDto,
  ) {
    return this.permissionService.getPermissionTemplates(churchId, dto);
  }

  @ApiPostPermissionTemplates()
  @Post('templates')
  postPermissionTemplates(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreatePermissionTemplateDto,
  ) {
    return this.permissionService.postPermissionTemplates(churchId, dto);
  }

  @ApiPostSamplePermissionTemplates()
  @Post('templates/sample')
  @UseInterceptors(TransactionInterceptor)
  postSamplePermissionTemplates(
    @Param('churchId', ParseIntPipe) churchId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.permissionService.postSamplePermissionTemplates(churchId, qr);
  }

  @ApiGetPermissionTemplateById()
  @Get('templates/:templateId')
  getPermissionTemplateById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('templateId', ParseIntPipe) templateId: number,
  ) {
    return this.permissionService.getPermissionTemplateById(
      churchId,
      templateId,
    );
  }

  @ApiPatchPermissionTemplate()
  @Patch('templates/:templateId')
  patchPermissionTemplate(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() dto: UpdatePermissionTemplateDto,
  ) {
    return this.permissionService.patchPermissionTemplate(
      churchId,
      templateId,
      dto,
    );
  }

  @ApiDeletePermissionTemplate()
  @Delete('templates/:templateId')
  deletePermissionTemplate(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('templateId', ParseIntPipe) templateId: number,
  ) {
    return this.permissionService.deletePermissionTemplate(
      churchId,
      templateId,
    );
  }
}
