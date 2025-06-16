import { Inject, Injectable } from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainPermissionService } from '../../permission/service/domain-permission.service';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

@Injectable()
export class VisitationPermissionService extends DomainPermissionService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
  ) {
    super();
  }

  override async hasPermission(
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
      DomainType.VISITATION,
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
