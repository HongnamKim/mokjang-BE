import { ConflictException, Inject, Injectable } from '@nestjs/common';
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
import { UpdatePermissionScopeDto } from '../dto/request/update-permission-scope.dto';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import {
  IPERMISSION_SCOPE_DOMAIN_SERVICE,
  IPermissionScopeDomainService,
} from '../../permission/permission-domain/service/interface/permission-scope-domain.service.interface';
import { PermissionScopeModel } from '../../permission/entity/permission-scope.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import { ChurchUserRole } from '../../user/const/user-role.enum';
import { PermissionScopeException } from '../../permission/exception/permission-scope.exception';

@Injectable()
export class ManagerService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
    @Inject(IPERMISSION_DOMAIN_SERVICE)
    private readonly permissionDomainService: IPermissionDomainService,
    @Inject(IPERMISSION_SCOPE_DOMAIN_SERVICE)
    private readonly permissionScopeDomainService: IPermissionScopeDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
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

  private async handleAllGroupScope(
    manager: ChurchUserModel,
    existingScope: PermissionScopeModel[],
    qr: QueryRunner,
  ) {
    const toRemove: PermissionScopeModel[] = [];

    // 기존 권한 범위 삭제
    existingScope.forEach((scope) => {
      if (!scope.isAllGroups) {
        toRemove.push(scope);
      }
    });

    if (toRemove.length > 0) {
      await this.permissionScopeDomainService.deletePermissionScope(
        toRemove,
        qr,
      );
    }

    // 기존 isAllGroups 가 존재하는지 확인
    const exists = existingScope.find((s) => s.isAllGroups);

    if (!exists) {
      // isAllGroups 가 true 인 PermissionScope 생성
      await this.permissionScopeDomainService.createAllGroupPermissionScope(
        manager,
        qr,
      );
    }
  }

  private async handlePermissionScopeChange(
    church: ChurchModel,
    manager: ChurchUserModel,
    existingScope: PermissionScopeModel[],
    dto: UpdatePermissionScopeDto,
    qr: QueryRunner,
  ) {
    const toCreate: number[] = [];
    const toRemove: PermissionScopeModel[] = [];

    const existingMap = new Map<number, PermissionScopeModel>();

    for (const scope of existingScope) {
      if (!scope.isAllGroups && scope.groupId !== null) {
        existingMap.set(scope.groupId, scope);
      }
    }

    const newSet = new Set(dto.groupIds);

    for (const [groupId, scope] of existingMap.entries()) {
      if (!newSet.has(groupId)) toRemove.push(scope);
    }

    for (const groupId of newSet) {
      if (!existingMap.has(groupId)) toCreate.push(groupId);
    }

    toRemove.push(...existingScope.filter((s) => s.isAllGroups));

    const toCreateGroups =
      toCreate.length > 0
        ? await this.groupsDomainService.findGroupModelsByIds(
            church,
            toCreate,
            qr,
          )
        : [];

    await this.permissionScopeDomainService.applyPermissionScopeChange(
      manager,
      toCreateGroups,
      toRemove,
      qr,
    );
  }

  async patchPermissionScope(
    churchId: number,
    managerId: number,
    dto: UpdatePermissionScopeDto,
    qr: QueryRunner,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const manager = await this.managerDomainService.findManagerById(
      church,
      managerId,
      qr,
    );

    if (manager.role === ChurchUserRole.OWNER) {
      throw new ConflictException(PermissionScopeException.OWNER);
    }

    const existingScope =
      await this.permissionScopeDomainService.findPermissionScopeByChurchUserId(
        manager,
        qr,
      );

    // 전체 그룹 범위 지정
    if (dto.isAllGroups) {
      await this.handleAllGroupScope(manager, existingScope, qr);

      return this.managerDomainService.findManagerById(church, managerId, qr);
    } else {
      await this.handlePermissionScopeChange(
        church,
        manager,
        existingScope,
        dto,
        qr,
      );

      return this.managerDomainService.findManagerById(church, managerId, qr);
    }
  }
}
