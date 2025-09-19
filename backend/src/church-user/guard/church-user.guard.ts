import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomRequest } from '../../common/custom-request';
import {
  ICHURCH_USER_DOMAIN_SERVICE,
  IChurchUserDomainService,
} from '../church-user-domain/service/interface/church-user-domain.service.interface';

@Injectable()
export class ChurchUserGuard implements CanActivate {
  constructor(
    @Inject(ICHURCH_USER_DOMAIN_SERVICE)
    private readonly churchUserDomainService: IChurchUserDomainService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();

    const token = req.tokenPayload;

    if (!token) {
      throw new InternalServerErrorException('JWT 처리 과정 누락');
    }

    const requestUserId = token.id;

    req.requestChurchUser =
      await this.churchUserDomainService.findChurchUserByUserId(requestUserId);

    return true;
  }
}
