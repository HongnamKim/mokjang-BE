import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { CustomRequest } from '../../common/custom-request';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ChurchModel } from '../../churches/entity/church.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

@Injectable()
export class ChurchManagerGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  private async getChurch(req: CustomRequest) {
    const churchId = parseInt(req.params.churchId);

    const churchKey = `church-${churchId}`;

    const cachedChurch = await this.cache.get<ChurchModel>(churchKey);

    if (cachedChurch) {
      return cachedChurch;
    }

    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      undefined,
      { subscription: true },
    );

    await this.cache.set(churchKey, church);

    return church;
  }

  private async getChurchManager(church: ChurchModel, requestUserId: number) {
    const managerKey = `manager-${requestUserId}`;

    const cachedManager = await this.cache.get<ChurchUserModel>(managerKey);

    if (cachedManager) {
      console.log('cache');
      return cachedManager;
    }

    console.log('db');
    const requestManager =
      await this.managerDomainService.findManagerForPermissionCheck(
        church,
        requestUserId,
      );

    await this.cache.set(managerKey, requestManager);

    return requestManager;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();

    const token = req.tokenPayload;

    if (!token) {
      throw new InternalServerErrorException('JWT 처리 과정 누락');
    }

    const requestUserId = token.id;

    const church = await this.getChurch(req);

    req.requestManager = await this.getChurchManager(church, requestUserId);
    /*await this.managerDomainService.findManagerForPermissionCheck(
        church,
        requestUserId,
        req.queryRunner,
      );*/

    req.church = church;

    return true;
  }
}
