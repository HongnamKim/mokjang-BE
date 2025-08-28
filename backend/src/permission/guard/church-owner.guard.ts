import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import { CustomRequest } from '../../common/custom-request';

@Injectable()
export class ChurchOwnerGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();

    const token = req.tokenPayload;

    if (!token) {
      throw new InternalServerErrorException('JWT 처리 과정 누락');
    }

    const churchId = parseInt(req.params.churchId);
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      req.queryRunner,
      { subscription: true },
    );

    req.church = church;

    if (church.ownerUserId !== token.id) {
      throw new ForbiddenException('교회 소유자만 접근할 수 있습니다.');
    }

    return true;
  }
}
