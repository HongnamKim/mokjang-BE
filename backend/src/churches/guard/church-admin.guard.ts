import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ChurchesService } from '../churches.service';

@Injectable()
export class ChurchAdminGuard implements CanActivate {
  constructor(private readonly churchService: ChurchesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = req.tokenPayload;

    const churchId = parseInt(req.params.churchId);

    const isAdmin = await this.churchService.isChurchAdmin(churchId, token.id);

    if (!isAdmin) {
      throw new ForbiddenException('해당 교회의 관리자만 접근할 수 있습니다.');
    }

    return true;
  }
}

@Injectable()
export class ChurchMainAdminGuard implements CanActivate {
  constructor(private readonly churchService: ChurchesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = req.tokenPayload;

    const churchId = parseInt(req.params.churchId);

    const isMainAdmin = await this.churchService.isChurchMainAdmin(
      churchId,
      token.id,
    );

    if (!isMainAdmin) {
      throw new ForbiddenException(
        '해당 교회의 최고 관리자만 접근할 수 있습니다.',
      );
    }

    return true;
  }
}
