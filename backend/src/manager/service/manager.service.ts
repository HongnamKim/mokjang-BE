import { Inject, Injectable } from '@nestjs/common';
import { GetManagersDto } from '../dto/request/get-managers.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import { QueryRunner } from 'typeorm';
import { ManagerPaginationResponseDto } from '../dto/response/manager-pagination-response.dto';
import { PatchManagerResponseDto } from '../dto/response/patch-manager-response.dto';
import { GetManagerResponseDto } from '../dto/response/get-manager-response.dto';
import { AssignPermissionTemplateDto } from '../dto/request/assign-permission-template.dto';
import {
  IPERMISSION_DOMAIN_SERVICE,
  IPermissionDomainService,
} from '../../permission/permission-domain/service/interface/permission-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../manager-domain/service/interface/manager-domain.service.interface';

@Injectable()
export class ManagerService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
    @Inject(IPERMISSION_DOMAIN_SERVICE)
    private readonly permissionDomainService: IPermissionDomainService,
  ) {}

  async getManagers(churchId: number, dto: GetManagersDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const { data, totalCount } = await this.managerDomainService.findManagers(
      church,
      dto,
    );

    return new ManagerPaginationResponseDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async togglePermissionActive(
    churchId: number,
    managerId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetManager = await this.managerDomainService.findManagerModelById(
      church,
      managerId,
      qr,
    );

    await this.managerDomainService.updatePermissionActive(
      targetManager,
      !targetManager.isPermissionActive,
      qr,
    );

    const updatedManager = await this.managerDomainService.findManagerById(
      church,
      managerId,
      qr,
    );

    return new PatchManagerResponseDto(updatedManager);
  }

  async getManagerById(churchId: number, managerId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const manager = await this.managerDomainService.findManagerById(
      church,
      managerId,
    );

    return new GetManagerResponseDto(manager);
  }

  async assignPermissionTemplate(
    churchId: number,
    managerId: number,
    dto: AssignPermissionTemplateDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const permissionTemplate =
      await this.permissionDomainService.findPermissionTemplateModelById(
        church,
        dto.permissionTemplateId,
        qr,
      );

    const manager = await this.managerDomainService.findManagerModelById(
      church,
      managerId,
      qr,
      { permissionTemplate: true },
    );

    // 기존 권한 유형이 있는 경우 memberCount 감소
    if (manager.permissionTemplateId) {
      await this.permissionDomainService.decrementMemberCount(
        manager.permissionTemplate,
        qr,
      );
    }

    await this.managerDomainService.assignPermissionTemplate(
      manager,
      permissionTemplate,
      qr,
    );

    await this.permissionDomainService.incrementMemberCount(
      permissionTemplate,
      qr,
    );

    const updatedManager = await this.managerDomainService.findManagerById(
      church,
      managerId,
      qr,
    );

    return new PatchManagerResponseDto(updatedManager);
  }

  async unassignPermissionTemplate(
    churchId: number,
    managerId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const manager = await this.managerDomainService.findManagerModelById(
      church,
      managerId,
      qr,
      { permissionTemplate: true },
    );

    await this.managerDomainService.unassignPermissionTemplate(manager, qr);

    manager.permissionTemplate &&
      (await this.permissionDomainService.decrementMemberCount(
        manager.permissionTemplate,
        qr,
      ));

    const updatedManager = await this.managerDomainService.findManagerById(
      church,
      managerId,
      qr,
    );

    return new PatchManagerResponseDto(updatedManager);
  }
}
