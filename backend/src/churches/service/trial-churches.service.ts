import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { ChurchUserRole, UserRole } from '../../user/const/user-role.enum';
import { PostChurchResponseDto } from '../dto/response/post-church-response.dto';
import { ChurchModel, ManagementCountType } from '../entity/church.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { subYears } from 'date-fns';
import { Gender } from '../../members/const/enum/gender.enum';
import { GroupModel } from '../../management/groups/entity/group.entity';
import {
  ISUBSCRIPTION_DOMAIN_SERVICE,
  ISubscriptionDomainService,
} from '../../subscription/subscription-domain/interface/subscription-domain.service.interface';
import {
  IDUMMY_MEMBERS_DOMAIN_SERVICE,
  IDummyMembersDomainService,
} from '../../dummy-data/dummy-data-domain/interface/dummy-members-domain.service.interface';
import {
  IDUMMY_OFFICER_DOMAIN_SERVICE,
  IDummyOfficerDomainService,
} from '../../dummy-data/dummy-data-domain/interface/dummy-officer-domain.service.interface';
import {
  IOFFICER_MEMBERS_DOMAIN_SERVICE,
  IOfficerMembersDomainService,
} from '../../members/member-domain/interface/officer-members-domain.service.interface';
import {
  IOFFICER_HISTORY_DOMAIN_SERVICE,
  IOfficerHistoryDomainService,
} from '../../member-history/officer-history/officer-history-domain/interface/officer-history-domain.service.interface';
import {
  IDUMMY_GROUP_DOMAIN_SERVICE,
  IDummyGroupDomainService,
} from '../../dummy-data/dummy-data-domain/interface/dummy-group-domain.service.interface';
import {
  IGROUP_MEMBERS_DOMAIN_SERVICE,
  IGroupMembersDomainService,
} from '../../members/member-domain/interface/group-members.domain.service.interface';
import {
  IGROUP_HISTORY_DOMAIN_SERVICE,
  IGroupHistoryDomainService,
} from '../../member-history/group-history/group-history-domain/interface/group-history-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../churches-domain/interface/churches-domain.service.interface';
import {
  ICHURCH_USER_DOMAIN_SERVICE,
  IChurchUserDomainService,
} from '../../church-user/church-user-domain/service/interface/church-user-domain.service.interface';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { SubscriptionStatus } from '../../subscription/const/subscription-status.enum';

@Injectable()
export class TrialChurchesService {
  constructor(
    private readonly dataSource: DataSource,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(ICHURCH_USER_DOMAIN_SERVICE)
    private readonly churchUserDomainService: IChurchUserDomainService,

    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(ISUBSCRIPTION_DOMAIN_SERVICE)
    private readonly subscriptionDomainService: ISubscriptionDomainService,

    @Inject(IDUMMY_MEMBERS_DOMAIN_SERVICE)
    private readonly dummyMembersDomainService: IDummyMembersDomainService,
    @Inject(IDUMMY_OFFICER_DOMAIN_SERVICE)
    private readonly dummyOfficersDomainService: IDummyOfficerDomainService,
    @Inject(IOFFICER_MEMBERS_DOMAIN_SERVICE)
    private readonly officerMembersDomainService: IOfficerMembersDomainService,
    @Inject(IOFFICER_HISTORY_DOMAIN_SERVICE)
    private readonly officerHistoryDomainService: IOfficerHistoryDomainService,
    @Inject(IDUMMY_GROUP_DOMAIN_SERVICE)
    private readonly dummyGroupDomainService: IDummyGroupDomainService,
    @Inject(IGROUP_MEMBERS_DOMAIN_SERVICE)
    private readonly groupMembersDomainService: IGroupMembersDomainService,
    @Inject(IGROUP_HISTORY_DOMAIN_SERVICE)
    private readonly groupHistoryDomainService: IGroupHistoryDomainService,
  ) {}

  async startTrialChurch(userId: number, qr: QueryRunner) {
    const user = await this.userDomainService.findUserWithChurchUserById(
      userId,
      qr,
    );

    if (user.role !== UserRole.NONE) {
      throw new ConflictException(
        '소속된 교회가 있는 사용자는 무료체험을 진행할 수 없습니다.',
      );
    }

    // 무료 체험 신청 구독 정보
    const subscription =
      await this.subscriptionDomainService.findTrialSubscription(user, qr);

    const newTrialChurch = await this.churchesDomainService.createTrialChurch(
      user,
      subscription,
      qr,
    );

    // 무료 체험 활성화
    await this.subscriptionDomainService.updateSubscriptionStatus(
      subscription,
      SubscriptionStatus.ACTIVE,
      qr,
    );

    const ownerMember = await this.membersDomainService.createMember(
      newTrialChurch,
      { name: user.name, mobilePhone: user.mobilePhone },
      qr,
    );

    await this.churchesDomainService.incrementMemberCount(newTrialChurch, qr);

    // 더미 교인 생성 (30명)
    const dummyMembers =
      await this.dummyMembersDomainService.createDummyMembers(
        newTrialChurch,
        30,
        qr,
      );
    await this.churchesDomainService.dummyMemberCount(newTrialChurch, 30, qr);

    // 더미 직분 생성/부여
    await this.createDummyOfficer(
      newTrialChurch,
      ownerMember,
      dummyMembers,
      qr,
    );

    await this.createDummyGroups(newTrialChurch, dummyMembers, qr);

    await this.churchUserDomainService.createChurchUser(
      newTrialChurch,
      user,
      ownerMember,
      ChurchUserRole.OWNER,
      qr,
    );

    await this.userDomainService.updateUserRole(
      user,
      { role: UserRole.OWNER },
      qr,
    );

    return new PostChurchResponseDto(newTrialChurch);
  }

  async endTrialChurch(userId: number, qr: QueryRunner) {
    const user = await this.userDomainService.findUserWithChurchUserById(
      userId,
      qr,
    );

    if (user.role !== UserRole.OWNER) {
      throw new ConflictException('운영 중인 교회가 없습니다.');
    }

    const trialChurch =
      await this.churchesDomainService.findTrialChurchByUserId(user, qr);

    await this.churchUserDomainService.deleteChurchUserCascade(trialChurch, qr);

    await this.officerHistoryDomainService.deleteDummyOfficerHistoriesCascade(
      trialChurch,
      qr,
    );
    await this.groupHistoryDomainService.deleteDummyGroupHistoriesCascade(
      trialChurch,
      qr,
    );

    await this.dummyMembersDomainService.deleteDummyMembersCascade(
      trialChurch,
      qr,
    );

    await this.dummyOfficersDomainService.deleteDummyOfficersCascade(
      trialChurch,
      qr,
    );

    await this.dummyGroupDomainService.deleteDummyGroupsCascade(
      trialChurch,
      qr,
    );

    await this.userDomainService.updateUserRole(
      user,
      { role: UserRole.NONE },
      qr,
    );

    const subscription =
      await this.subscriptionDomainService.findSubscriptionModelByStatus(
        user,
        SubscriptionStatus.ACTIVE,
        qr,
      );

    await this.subscriptionDomainService.updateSubscriptionStatus(
      subscription,
      SubscriptionStatus.PENDING,
      qr,
    );

    await this.churchesDomainService.deleteChurchCascade(trialChurch, qr);

    return 'success';
  }

  private async createDummyOfficer(
    newTrialChurch: ChurchModel,
    ownerMember: MemberModel,
    dummyMembers: MemberModel[],
    qr: QueryRunner,
  ) {
    // 목사, 장로, 권사, 집사 생성
    const dummyOfficers =
      await this.dummyOfficersDomainService.createDummyOfficers(
        newTrialChurch,
        qr,
      );

    // 교회 내 직분 개수 업데이트
    await this.churchesDomainService.refreshManagementCount(
      newTrialChurch,
      ManagementCountType.OFFICER,
      dummyOfficers.length,
      qr,
    );

    // 목사 직분 부여
    await this.officerMembersDomainService.assignOfficer(
      [ownerMember],
      dummyOfficers[0],
      qr,
    );
    await this.officerHistoryDomainService.startOfficerHistory(
      [ownerMember],
      dummyOfficers[0],
      new Date(),
      qr,
    );

    // 장로 직분 부여
    const first = this.pickRandomMembers(dummyMembers, 2);
    await this.officerMembersDomainService.assignOfficer(
      first.picked,
      dummyOfficers[1],
      qr,
    );
    await this.officerHistoryDomainService.startOfficerHistory(
      first.picked,
      dummyOfficers[1],
      new Date(),
      qr,
    );

    // 권사 직분 부여
    const second = this.pickRandomMembers(first.remaining, 8);
    await this.officerMembersDomainService.assignOfficer(
      second.picked,
      dummyOfficers[2],
      qr,
    );
    await this.officerHistoryDomainService.startOfficerHistory(
      second.picked,
      dummyOfficers[2],
      new Date(),
      qr,
    );

    // 집사 직분 부여
    await this.officerMembersDomainService.assignOfficer(
      second.remaining,
      dummyOfficers[3],
      qr,
    );
    await this.officerHistoryDomainService.startOfficerHistory(
      second.remaining,
      dummyOfficers[3],
      new Date(),
      qr,
    );
  }

  private pickRandomMembers(members: MemberModel[], count: number) {
    const shuffled = [...members];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const picked = shuffled.slice(0, count);
    const remaining = shuffled.slice(count);

    return { picked, remaining };
  }

  private async createDummyGroups(
    newTrialChurch: ChurchModel,
    dummyMembers: MemberModel[],
    qr: QueryRunner,
  ) {
    const { maleGroup, femaleGroup, childGroup } =
      await this.dummyGroupDomainService.createDummyGroups(newTrialChurch, qr);

    await this.churchesDomainService.refreshManagementCount(
      newTrialChurch,
      ManagementCountType.GROUP,
      4,
      qr,
    );

    const adultMaleMembers: MemberModel[] = [];
    const adultFemaleMembers: MemberModel[] = [];
    const childMembers: MemberModel[] = [];

    dummyMembers.forEach((member) => {
      const adultDate = subYears(new Date(), 20);

      if (member.birth > adultDate) {
        childMembers.push(member);
      } else if (member.gender === Gender.MALE) {
        adultMaleMembers.push(member);
      } else {
        adultFemaleMembers.push(member);
      }
    });

    // 남선 교회 부여
    await this.groupMembersDomainService.assignGroup(
      adultMaleMembers,
      maleGroup,
      qr,
    );
    await this.groupHistoryDomainService.startGroupHistories(
      adultMaleMembers,
      maleGroup,
      new Date(),
      qr,
    );

    // 여선 교회 부여
    await this.groupMembersDomainService.assignGroup(
      adultFemaleMembers,
      femaleGroup,
      qr,
    );
    await this.groupHistoryDomainService.startGroupHistories(
      adultFemaleMembers,
      femaleGroup,
      new Date(),
      qr,
    );

    // 교회 학교 부여
    await this.groupMembersDomainService.assignGroup(
      childMembers,
      childGroup,
      qr,
    );
    await this.groupHistoryDomainService.startGroupHistories(
      childMembers,
      childGroup,
      new Date(),
      qr,
    );

    const values: { group: GroupModel; count: number }[] = [
      {
        group: maleGroup,
        count: adultMaleMembers.length,
      },
      {
        group: femaleGroup,
        count: adultFemaleMembers.length,
      },
      {
        group: childGroup,
        count: childMembers.length,
      },
    ];

    await this.dummyGroupDomainService.updateMembersCount(values, qr);
  }
}
