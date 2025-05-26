import { Inject, Injectable } from '@nestjs/common';
import {
  IPERMISSION_DOMAIN_SERVICE,
  IPermissionDomainService,
} from '../permission-domain/service/interface/permission-domain.service.interface';
import { DomainType } from '../const/domain-type.enum';
import { GetPermissionTemplateDto } from '../dto/template/request/get-permission-template.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import { PermissionTemplatePaginationResponseDto } from '../dto/template/response/permission-template-pagination-response.dto';
import { CreatePermissionTemplateDto } from '../dto/template/request/create-permission-template.dto';
import { PostPermissionTemplateResponseDto } from '../dto/template/response/post-permission-template-response.dto';
import { GetPermissionUnitResponseDto } from '../dto/unit/get-permission-unit-response.dto';
import { GetPermissionTemplateResponseDto } from '../dto/template/response/get-permission-template-response.dto';
import { UpdatePermissionTemplateDto } from '../dto/template/request/update-permission-template.dto';
import { PatchPermissionTemplateResponseDto } from '../dto/template/response/patch-permission-template-response.dto';
import { DeletePermissionTemplateResponseDto } from '../dto/template/response/delete-permission-template-response.dto';
import { QueryRunner } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,

    @Inject(IPERMISSION_DOMAIN_SERVICE)
    private readonly permissionDomainService: IPermissionDomainService,
  ) {}

  async getPermissionUnits(domain?: DomainType) {
    const units =
      await this.permissionDomainService.findPermissionUnits(domain);

    return new GetPermissionUnitResponseDto(units);
  }

  async getPermissionTemplates(
    churchId: number,
    dto: GetPermissionTemplateDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const { data, totalCount } =
      await this.permissionDomainService.findPermissionTemplates(church, dto);

    return new PermissionTemplatePaginationResponseDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async postPermissionTemplates(
    churchId: number,
    dto: CreatePermissionTemplateDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const newTemplate =
      await this.permissionDomainService.createPermissionTemplate(church, dto);

    return new PostPermissionTemplateResponseDto(newTemplate);
  }

  async getPermissionTemplateById(churchId: number, templateId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const template =
      await this.permissionDomainService.findPermissionTemplateById(
        church,
        templateId,
      );

    return new GetPermissionTemplateResponseDto(template);
  }

  async patchPermissionTemplate(
    churchId: number,
    templateId: number,
    dto: UpdatePermissionTemplateDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const targetTemplate =
      await this.permissionDomainService.findPermissionTemplateModelById(
        church,
        templateId,
      );

    await this.permissionDomainService.updatePermissionTemplate(
      church,
      targetTemplate,
      dto,
    );

    const updatedTemplate =
      await this.permissionDomainService.findPermissionTemplateById(
        church,
        templateId,
      );

    return new PatchPermissionTemplateResponseDto(updatedTemplate);
  }

  async deletePermissionTemplate(churchId: number, templateId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const targetTemplate =
      await this.permissionDomainService.findPermissionTemplateModelById(
        church,
        templateId,
      );

    await this.permissionDomainService.deletePermissionTemplate(targetTemplate);

    return new DeletePermissionTemplateResponseDto(
      new Date(),
      templateId,
      targetTemplate.title,
      true,
    );
  }

  async postSamplePermissionTemplates(churchId: number, qr: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const educationManager: CreatePermissionTemplateDto = {
      title: '교육 관리자(샘플)',
      unitIds: [9, 10, 11, 12],
    };

    const visitationManager: CreatePermissionTemplateDto = {
      title: '심방 관리자(샘플)',
      unitIds: [5, 6, 7, 8],
    };

    const educationTemplate =
      await this.permissionDomainService.createPermissionTemplate(
        church,
        educationManager,
        qr,
      );
    const visitationTemplate =
      await this.permissionDomainService.createPermissionTemplate(
        church,
        visitationManager,
        qr,
      );

    return [educationTemplate, visitationTemplate];
  }
}
