import { Inject, Injectable } from '@nestjs/common';
import { DomainPermissionService } from '../../permission/service/domain-permission.service';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { DomainType } from '../../permission/const/domain-type.enum';

@Injectable()
export class HistoryPermissionService extends DomainPermissionService {
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

    const permission = super.checkPermission(
      DomainType.MEMBER,
      domainAction,
      requestManager,
    );

    if (permission) {
      return requestManager;
    } else {
      return null;
    }
  }
}
