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

@Injectable()
export class ChurchManagerGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();

    const token = req.tokenPayload;

    if (!token) {
      throw new InternalServerErrorException('JWT 처리 과정 누락');
    }

    const churchId = parseInt(req.params.churchId);
    const requestUserId = token.id;

    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      req.queryRunner,
      { subscription: true },
    );

    console.log(church);

    req.requestManager =
      await this.managerDomainService.findManagerForPermissionCheck(
        church,
        requestUserId,
        req.queryRunner,
      );
    req.church = church;

    return true;
  }
}
