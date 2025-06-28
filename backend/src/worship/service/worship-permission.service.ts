import { DomainPermissionService } from '../../permission/service/domain-permission.service';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { Inject } from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { DomainType } from '../../permission/const/domain-type.enum';

export class WorshipPermissionService extends DomainPermissionService {
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
  ): Promise<{
    requestManager: ChurchUserModel;
    church: ChurchModel;
  }> {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const requestManager =
      await this.managerDomainService.findManagerForPermissionCheck(
        church,
        requestUserId,
      );

    return { requestManager, church };
  }

  async hasPermission(
    churchId: number,
    requestUserId: number,
    domainAction: DomainAction,
  ): Promise<{
    requestManager: ChurchUserModel;
    church: ChurchModel;
  } | null> {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const requestManager =
      await this.managerDomainService.findManagerForPermissionCheck(
        church,
        requestUserId,
      );

    const permission = super.checkPermission(
      DomainType.WORSHIP,
      domainAction,
      requestManager,
    );

    if (permission) {
      return { requestManager, church };
    } else {
      return null;
    }
  }
}
