import { Inject, Injectable } from '@nestjs/common';
import { DomainPermissionService } from '../../permission/service/domain-permission.service';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { DomainAction } from '../../permission/const/domain-action.enum';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../churches-domain/interface/churches-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { ChurchUserRole } from '../../user/const/user-role.enum';

@Injectable()
export class ChurchPermissionService extends DomainPermissionService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
  ) {
    super();
  }

  async getRequestManagerOrThrow(
    churchId: number,
    requestUserId: number,
  ): Promise<ChurchUserModel> {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    return this.managerDomainService.findManagerForPermissionCheck(
      church,
      requestUserId,
    );
  }

  async hasPermission(
    churchId: number,
    requestUserId: number,
    domainAction: DomainAction,
  ): Promise<ChurchUserModel | null> {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const requestManager =
      await this.managerDomainService.findManagerForPermissionCheck(
        church,
        requestUserId,
      );

    if (domainAction === DomainAction.WRITE) {
      if (requestManager.role === ChurchUserRole.OWNER) {
        return requestManager;
      } else {
        return null;
      }
    } else {
      // 읽기 권한인 경우 교회 관리자 통과
      return requestManager;
    }
    /*const permission = super.checkPermission(
      DomainType.MANAGEMENT,
      domainAction,
      requestManager,
    );

    if (permission) {
      return requestManager;
    } else {
      return null;
    }*/
  }
}
