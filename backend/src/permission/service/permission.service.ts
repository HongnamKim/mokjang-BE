import { Inject, Injectable } from '@nestjs/common';
import {
  IPERMISSION_DOMAIN_SERVICE,
  IPermissionDomainService,
} from '../permission-domain/service/interface/permission-domain.service.interface';
import { DomainType } from '../const/domain-type.enum';
import { GetPermissionTemplateDto } from '../dto/template/request/get-permission-template.dto';
import { PermissionTemplatePaginationResponseDto } from '../dto/template/response/permission-template-pagination-response.dto';
import { CreatePermissionTemplateDto } from '../dto/template/request/create-permission-template.dto';
import { PostPermissionTemplateResponseDto } from '../dto/template/response/post-permission-template-response.dto';
import { GetPermissionUnitResponseDto } from '../dto/unit/get-permission-unit-response.dto';
import { GetPermissionTemplateResponseDto } from '../dto/template/response/get-permission-template-response.dto';
import { UpdatePermissionTemplateDto } from '../dto/template/request/update-permission-template.dto';
import { PatchPermissionTemplateResponseDto } from '../dto/template/response/patch-permission-template-response.dto';
import { DeletePermissionTemplateResponseDto } from '../dto/template/response/delete-permission-template-response.dto';
import { QueryRunner } from 'typeorm';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { MemberPaginationResponseDto } from '../../members/dto/response/member-pagination-response.dto';
import { GetManagersByPermissionTemplateDto } from '../dto/template/request/get-managers-by-permission-template.dto';
import { ChurchModel } from '../../churches/entity/church.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { PermissionNotificationService } from './permission-notification.service';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionNotificationService: PermissionNotificationService,

    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,

    @Inject(IPERMISSION_DOMAIN_SERVICE)
    private readonly permissionDomainService: IPermissionDomainService,
  ) {}

  async getPermissionUnits(domain?: DomainType) {
    const units =
      await this.permissionDomainService.findPermissionUnits(domain);

    return new GetPermissionUnitResponseDto(units);
  }

  async getPermissionTemplates(
    church: ChurchModel,
    dto: GetPermissionTemplateDto,
  ) {
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
    church: ChurchModel,
    dto: CreatePermissionTemplateDto,
  ) {
    const newTemplate =
      await this.permissionDomainService.createPermissionTemplate(church, dto);

    return new PostPermissionTemplateResponseDto(newTemplate);
  }

  async getPermissionTemplateById(church: ChurchModel, templateId: number) {
    const template =
      await this.permissionDomainService.findPermissionTemplateById(
        church,
        templateId,
      );

    return new GetPermissionTemplateResponseDto(template);
  }

  async patchPermissionTemplate(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    templateId: number,
    dto: UpdatePermissionTemplateDto,
  ) {
    const targetTemplate =
      await this.permissionDomainService.findPermissionTemplateModelById(
        church,
        templateId,
        undefined,
        { permissionUnits: true },
      );

    await this.permissionDomainService.updatePermissionTemplate(
      church,
      targetTemplate,
      dto,
    );

    const owner =
      await this.managerDomainService.findOwnerForNotification(church);

    const notificationTargets =
      await this.managerDomainService.findManagersByPermissionTemplateForNotification(
        church,
        targetTemplate,
      );

    this.permissionNotificationService.notifyPermissionTemplateUpdated(
      requestManager,
      notificationTargets,
      owner,
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

  async deletePermissionTemplate(church: ChurchModel, templateId: number) {
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

  async postSamplePermissionTemplates(church: ChurchModel, qr: QueryRunner) {
    const educationUnits =
      await this.permissionDomainService.findPermissionUnits(
        DomainType.EDUCATION,
      );

    const educationManager: CreatePermissionTemplateDto = {
      title: '교육 관리자(샘플)',
      description: '교회의 교육을 열람/작성합니다.',
      unitIds: educationUnits.map((unit) => unit.id),
    };

    const visitationUnits =
      await this.permissionDomainService.findPermissionUnits(
        DomainType.VISITATION,
      );

    const visitationManager: CreatePermissionTemplateDto = {
      title: '심방 관리자(샘플)',
      description: '교인의 심방을 열람/작성합니다.',
      unitIds: visitationUnits.map((unit) => unit.id),
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

  async getManagersByPermissionTemplate(
    church: ChurchModel,
    templateId: number,
    dto: GetManagersByPermissionTemplateDto,
  ) {
    const permissionTemplate =
      await this.permissionDomainService.findPermissionTemplateModelById(
        church,
        templateId,
      );

    const { data, totalCount } =
      await this.managerDomainService.findManagersByPermissionTemplate(
        church,
        permissionTemplate,
        dto,
      );

    const managerMember = data.map((churchUser) => churchUser.member);

    return new MemberPaginationResponseDto(
      managerMember,
      totalCount,
      managerMember.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }
}
