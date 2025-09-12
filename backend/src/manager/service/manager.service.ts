import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { GetManagersDto } from '../dto/request/get-managers.dto';
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
import { ManagerNotificationService } from './manager-notification.service';
import { ChurchUserException } from '../../church-user/exception/church-user.exception';

@Injectable()
export class ManagerService {
  constructor(
    private readonly managerNotificationService: ManagerNotificationService,

    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
    @Inject(IPERMISSION_DOMAIN_SERVICE)
    private readonly permissionDomainService: IPermissionDomainService,
    @Inject(IPERMISSION_SCOPE_DOMAIN_SERVICE)
    private readonly permissionScopeDomainService: IPermissionScopeDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  async getManagers(church: ChurchModel, dto: GetManagersDto) {
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
    church: ChurchModel,
    requestManager: ChurchUserModel,
    churchUserId: number,
    qr: QueryRunner,
  ) {
    const targetManager = await this.managerDomainService.findManagerModelById(
      church,
      churchUserId,
      qr,
      { member: true },
    );

    if (!targetManager.member) {
      throw new ConflictException(ChurchUserException.NOT_LINKED);
    }

    await this.managerDomainService.updatePermissionActive(
      targetManager,
      !targetManager.isPermissionActive,
      qr,
    );

    const updatedManager = await this.managerDomainService.findManagerById(
      church,
      churchUserId,
      qr,
    );

    const owner = await this.managerDomainService.findOwnerForNotification(
      church,
      qr,
    );

    this.managerNotificationService.notifyPermissionUpdated(
      requestManager,
      targetManager,
      owner,
    );

    return new PatchManagerResponseDto(updatedManager);
  }

  async getManagerById(church: ChurchModel, churchUserId: number) {
    const manager = await this.managerDomainService.findManagerById(
      church,
      churchUserId,
    );

    return new GetManagerResponseDto(manager);
  }

  async assignPermissionTemplate(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    churchUserId: number,
    dto: AssignPermissionTemplateDto,
    qr: QueryRunner,
  ) {
    const permissionTemplate =
      await this.permissionDomainService.findPermissionTemplateModelById(
        church,
        dto.permissionTemplateId,
        qr,
      );

    const manager = await this.managerDomainService.findManagerModelById(
      church,
      churchUserId,
      qr,
      { member: true, permissionTemplate: true },
    );

    // 기존 권한 유형이 있는 경우 memberCount 감소
    if (manager.permissionTemplateId && manager.permissionTemplate) {
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

    const owner = await this.managerDomainService.findOwnerForNotification(
      church,
      qr,
    );

    manager.permissionTemplateId !== dto.permissionTemplateId &&
      this.managerNotificationService.notifyPermissionUpdated(
        requestManager,
        manager,
        owner,
      );

    const updatedManager = await this.managerDomainService.findManagerById(
      church,
      churchUserId,
      qr,
    );

    return new PatchManagerResponseDto(updatedManager);
  }

  async unassignPermissionTemplate(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    churchUserId: number,
    qr: QueryRunner,
  ) {
    const manager = await this.managerDomainService.findManagerModelById(
      church,
      churchUserId,
      qr,
      { member: true, permissionTemplate: true },
    );

    await this.managerDomainService.unassignPermissionTemplate(manager, qr);

    manager.permissionTemplate &&
      (await this.permissionDomainService.decrementMemberCount(
        manager.permissionTemplate,
        qr,
      ));

    const owner = await this.managerDomainService.findOwnerForNotification(
      church,
      qr,
    );

    this.managerNotificationService.notifyPermissionUpdated(
      requestManager,
      manager,
      owner,
    );

    const updatedManager = await this.managerDomainService.findManagerById(
      church,
      churchUserId,
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
    church: ChurchModel,
    requestManager: ChurchUserModel,
    churchUserId: number,
    dto: UpdatePermissionScopeDto,
    qr: QueryRunner,
  ) {
    const manager = await this.managerDomainService.findManagerById(
      church,
      churchUserId,
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

    const owner = await this.managerDomainService.findOwnerForNotification(
      church,
      qr,
    );

    // 전체 그룹 범위 지정
    if (dto.isAllGroups) {
      await this.handleAllGroupScope(manager, existingScope, qr);

      this.managerNotificationService.notifyPermissionUpdated(
        requestManager,
        manager,
        owner,
      );

      return this.managerDomainService.findManagerById(
        church,
        churchUserId,
        qr,
      );
    } else {
      await this.handlePermissionScopeChange(
        church,
        manager,
        existingScope,
        dto,
        qr,
      );

      this.managerNotificationService.notifyPermissionUpdated(
        requestManager,
        manager,
        owner,
      );

      return this.managerDomainService.findManagerById(
        church,
        churchUserId,
        qr,
      );
    }
  }
}
