import { Injectable } from '@nestjs/common';
import { IMemberFilterService } from './interface/member-filter.service.interface';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { MemberModel } from '../entity/member.entity';
import { ChurchUserRole } from '../../user/const/user-role.enum';
import { ConcealedMemberDto } from '../dto/response/get-member-response.dto';

@Injectable()
export class MemberFilterService implements IMemberFilterService {
  constructor() {}

  async filterMember(
    requestManager: ChurchUserModel,
    member: MemberModel,
    scopeGroupIds: number[],
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

    const possibleGroupIds = new Set(scopeGroupIds);

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
      'vehicleNumber',
      'churchUser',
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
    requestManager: ChurchUserModel,
    members: MemberModel[],
    scopeGroupIds: number[],
  ) {
    return Promise.all(
      members.map((member) =>
        this.filterMember(requestManager, member, scopeGroupIds),
      ),
    );
  }
}
