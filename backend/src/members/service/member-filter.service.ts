import { Inject, Injectable } from '@nestjs/common';
import { IMemberFilterService } from './interface/member-filter.service.interface';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { MemberModel } from '../entity/member.entity';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { ChurchUserRole } from '../../user/const/user-role.enum';

@Injectable()
export class MemberFilterService implements IMemberFilterService {
  constructor(
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  async filterMember(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    member: MemberModel,
  ): Promise<MemberModel> {
    if (!member.groupId) {
      return member;
    }

    if (requestManager.role === ChurchUserRole.OWNER) {
      return member;
    }

    const memberGroup = await this.groupsDomainService.findGroupModelById(
      church,
      member.groupId,
    );

    const memberParentGroups = await this.groupsDomainService.findParentGroups(
      church,
      memberGroup,
    );

    const possibleScopes = memberParentGroups.map(
      (parentGroup) => parentGroup.id,
    );
    possibleScopes.push(member.groupId);

    const possibleScopesSet = new Set(possibleScopes);

    const managerScopes = requestManager.permissionScopes.map(
      (scope) => scope.group.id,
    );

    for (const managerScope of managerScopes) {
      if (possibleScopesSet.has(managerScope)) {
        return member;
      }
    }

    return this.concealInfo(member);
  }

  private concealInfo(member: MemberModel) {
    const openInfo = new Set([
      'id',
      'createdAt',
      'updatedAt',
      'registeredAt',
      'profileImageUrl',
      'name',
      'birth',
      'isLunar',
      'gender',
      'group',
      'groupRole',
      'officer',
      'ministries',
      'educations',
    ]);

    for (const key of Object.keys(member)) {
      if (openInfo.has(key)) {
        continue;
      }
      member[key] = 'CONCEALED';
    }

    return member;
  }

  async filterMembers(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    members: MemberModel[],
  ) {
    return Promise.all(
      members.map((member) =>
        this.filterMember(church, requestManager, member),
      ),
    );
  }
}
