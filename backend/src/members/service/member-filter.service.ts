import { Inject, Injectable } from '@nestjs/common';
import { IMemberFilterService } from './interface/member-filter.service.interface';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { MemberModel } from '../entity/member.entity';
import { ChurchUserRole } from '../../user/const/user-role.enum';
import { ConcealedMemberDto } from '../dto/response/get-member-response.dto';
import { ChurchModel } from '../../churches/entity/church.entity';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import { QueryRunner } from 'typeorm';
import { MemberDto } from '../dto/member.dto';

@Injectable()
export class MemberFilterService implements IMemberFilterService {
  constructor(
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  filterMember(
    requestManager: ChurchUserModel,
    member: MemberModel,
    scopeGroupIds: number[],
  ): ConcealedMemberDto {
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
      'ministryGroups',
      'ministryGroupRole',
      'officer',
      'ministries',
      'educations',
      'vehicleNumber',
      'churchUser',
      'groupHistory',
      'ministryGroupHistory',
      'officerHistory',
    ]);

    for (const key of Object.keys(member)) {
      if (openInfo.has(key)) {
        continue;
      }
      member[key] = 'CONCEALED';
    }

    return member;
  }

  filterMemberDto(
    requestManager: ChurchUserModel,
    memberDto: MemberDto[],
    scopeGroupIds: number[],
  ): MemberDto[] {
    const possibleGroupIds = new Set(scopeGroupIds);

    return memberDto.map((member) => {
      if (requestManager.memberId === member.id) {
        return { ...member };
      }

      if (requestManager.role === ChurchUserRole.OWNER) {
        return { ...member };
      }

      if (requestManager.permissionScopes.find((scope) => scope.isAllGroups)) {
        return { ...member };
      }

      if (!member.group) {
        return { ...member, mobilePhone: 'CONCEALED' };
      }

      if (possibleGroupIds.has(member.group.id)) {
        return { ...member };
      } else {
        return { ...member, mobilePhone: 'CONCEALED' };
      }
    });
  }

  filterMembers(
    requestManager: ChurchUserModel,
    members: MemberModel[],
    scopeGroupIds: number[],
  ) {
    return members.map((member) =>
      this.filterMember(requestManager, member, scopeGroupIds),
    );
  }

  async getScopeGroupIds(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    qr?: QueryRunner,
  ): Promise<number[]> {
    const permissionScopeIds = requestManager.permissionScopes.map(
      (scope) => scope.group.id,
    );

    const possibleGroups =
      await this.groupsDomainService.findGroupAndDescendantsByIds(
        church,
        permissionScopeIds,
        qr,
      );

    return possibleGroups.map((group) => group.id);
  }
}
