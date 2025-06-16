import { Inject, Injectable } from '@nestjs/common';
import { DomainPermissionService } from './domain-permission.service';
import { DomainAction } from '../const/domain-action.enum';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { DomainType } from '../const/domain-type.enum';

@Injectable()
export class PermissionPermissionService extends DomainPermissionService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
  ) {
    super();
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
      DomainType.PERMISSION,
      domainAction,
      requestManager,
    );

    if (permission) {
      return requestManager;
    } else {
      return null;
    }
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
}
