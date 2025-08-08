import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../worship-domain/interface/worship-domain.service.interface';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import { WorshipException } from '../exception/worship.exception';
import { ChurchModel } from '../../churches/entity/church.entity';
import { CustomRequest } from '../../common/custom-request';

/**
 * 필터링 요청한 그룹이 해당 예배의 대상 그룹인지 검사
 */
@Injectable()
export class WorshipGroupFilterGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  private async getRequestChurch(req: CustomRequest) {
    const churchId = parseInt(req.params.churchId);

    if (req.church) {
      return req.church;
    } else {
      const church =
        await this.churchesDomainService.findChurchModelById(churchId);

      req.church = church;

      return church;
    }
  }

  private async getRequestWorship(req: CustomRequest, church: ChurchModel) {
    const worshipId = parseInt(req.params.worshipId);

    if (req.worship) {
      return req.worship;
    } else {
      const worship = await this.worshipDomainService.findWorshipModelById(
        church,
        worshipId,
        undefined,
        { worshipTargetGroups: { group: true } },
      );

      req.worship = worship;

      return worship;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();

    const church = await this.getRequestChurch(req);

    const worship = await this.getRequestWorship(req, church);

    // 조회 요청 그룹 ID
    const requestGroupId = parseInt(req.query.groupId as string);

    // 필터링할 그룹이 없을 경우 통과
    if (!requestGroupId) return true;

    const worshipTargetGroups = worship.worshipTargetGroups.map(
      (targetGroup) => targetGroup.group,
    );

    // 대상 그룹이 전체인 예배
    if (worshipTargetGroups.length === 0) {
      return true;
    }

    // 대상 그룹과 그 하위 그룹의 ID 들
    const allowedGroupIds = (
      await this.groupsDomainService.findGroupAndDescendantsByIds(
        church,
        worshipTargetGroups.map((group) => group.id),
      )
    ).map((group) => group.id);

    // 요청 그룹이 대상 그룹에 포함되지 않은 경우 ForbiddenException
    if (!allowedGroupIds.includes(requestGroupId)) {
      throw new ForbiddenException(WorshipException.INVALID_TARGET_GROUP);
    }

    return true;
  }
}
