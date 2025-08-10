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
import { ConcealedMemberDto } from '../dto/response/get-member-response.dto';

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
  ): Promise<ConcealedMemberDto> {
    if (requestManager.memberId === member.id) {
      return { ...member, isConcealed: false };
    }

    if (requestManager.role === ChurchUserRole.OWNER) {
      return { ...member, isConcealed: false };
    }

    if (requestManager.permissionScopes.find((scope) => scope.isAllGroups)) {
      return { ...member, isConcealed: false };
    }

    if (!member.groupId) {
      return { ...this.concealInfo(member), isConcealed: true };
    }

    const permissionScopeIds = requestManager.permissionScopes.map(
      (scope) => scope.groupId,
    );

    const possibleGroups =
      await this.groupsDomainService.findGroupAndDescendantsByIds(
        church,
        permissionScopeIds,
      );

    const possibleGroupIds = new Set(possibleGroups.map((group) => group.id));

    if (possibleGroupIds.has(member.groupId)) {
      return { ...member, isConcealed: false };
    } else {
      return { ...this.concealInfo(member), isConcealed: true };
    }
  }

  private concealInfo(member: MemberModel) {
    const openInfo = new Set([
      'id',
      'createdAt',
      'updatedAt',
      'registeredAt',
      'profileImageUrl',
      'baptism',
      'name',
      'birth',
      'isLunar',
      'isLeafMonth',
      'gender',
      'group',
      'groupRole',
      'ministryGroupRole',
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
