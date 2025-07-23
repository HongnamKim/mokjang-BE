import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { GetOfficerMembersDto } from '../dto/request/members/get-officer-members.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IOFFICERS_DOMAIN_SERVICE,
  IOfficersDomainService,
} from '../officer-domain/interface/officers-domain.service.interface';
import {
  IOFFICER_MEMBERS_DOMAIN_SERVICE,
  IOfficerMembersDomainService,
} from '../../../members/member-domain/interface/officer-members-domain.service.interface';
import { GetOfficerMembersResponseDto } from '../dto/response/members/get-officer-members-response.dto';
import { AddMembersToOfficerDto } from '../dto/request/members/add-members-to-officer.dto';
import { QueryRunner } from 'typeorm';
import { RemoveMembersFromOfficerDto } from '../dto/request/members/remove-members-from-officer.dto';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import { AddMembersToOfficerResponseDto } from '../dto/response/members/add-members-to-officer-response.dto';
import { RemoveMembersFromOfficerResponseDto } from '../dto/response/members/remove-members-from-officer-response.dto';
import { OfficerModel } from '../entity/officer.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { MemberException } from '../../../members/exception/member.exception';
import {
  IOFFICER_HISTORY_DOMAIN_SERVICE,
  IOfficerHistoryDomainService,
} from '../../../member-history/officer-history/officer-history-domain/interface/officer-history-domain.service.interface';

@Injectable()
export class OfficerMembersService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IOFFICERS_DOMAIN_SERVICE)
    private readonly officersDomainService: IOfficersDomainService,

    @Inject(IOFFICER_MEMBERS_DOMAIN_SERVICE)
    private readonly officerMembersDomainService: IOfficerMembersDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IOFFICER_HISTORY_DOMAIN_SERVICE)
    private readonly officerHistoryDomainService: IOfficerHistoryDomainService,
  ) {}

  async getOfficerMembers(
    churchId: number,
    officerId: number,
    dto: GetOfficerMembersDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const officer = await this.officersDomainService.findOfficerModelById(
      church,
      officerId,
    );

    const data = await this.officerMembersDomainService.findOfficerMembers(
      church,
      officer,
      dto,
    );

    return new GetOfficerMembersResponseDto(data);
  }

  async addMembersToOfficer(
    churchId: number,
    officerId: number,
    dto: AddMembersToOfficerDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const officer = await this.officersDomainService.findOfficerModelById(
      church,
      officerId,
      qr,
    );

    const members = await this.membersDomainService.findMembersById(
      church,
      dto.memberIds,
      qr,
      { officer: true },
    );

    const sameOfficer = members.some(
      (member) => member.officerId === officerId,
    );

    if (sameOfficer) {
      throw new ConflictException(MemberException.ALREADY_SAME_OFFICER);
    }

    // 기존 직분 이력 종료 처리
    const changeOfficerMembers = members.filter((member) => member.officerId);
    await this.officerHistoryDomainService.endOfficerHistories(
      changeOfficerMembers,
      qr,
    );

    // 교인에게 직분 부여
    await this.officerMembersDomainService.assignOfficer(members, officer, qr);

    // 직분 내 교인 수 증가
    await this.officersDomainService.incrementMembersCount(
      officer,
      members.length,
      qr,
    );

    // 새 직분 이력 시작
    await this.officerHistoryDomainService.startOfficerHistory(
      members,
      officer,
      qr,
    );

    // 기존 직분 교인 수 감소
    await this.decrementOldOfficers(changeOfficerMembers, qr);

    officer.membersCount += members.length;

    return new AddMembersToOfficerResponseDto(officer);
  }

  async removeMembersFromOfficer(
    churchId: number,
    officerId: number,
    dto: RemoveMembersFromOfficerDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const officer = await this.officersDomainService.findOfficerModelById(
      church,
      officerId,
      qr,
    );

    const removeMembers =
      await this.officerMembersDomainService.findOfficerMembersByIds(
        church,
        officer,
        dto.memberIds,
        qr,
      );

    await this.officerMembersDomainService.removeOfficer(removeMembers, qr);

    await this.officersDomainService.decrementMembersCount(
      officer,
      removeMembers.length,
      qr,
    );

    await this.officerHistoryDomainService.endOfficerHistories(
      removeMembers,
      qr,
      officer,
    );

    officer.membersCount -= removeMembers.length;

    return new RemoveMembersFromOfficerResponseDto(officer);
  }

  private async decrementOldOfficers(
    changeOfficerMembers: MemberModel[],
    qr: QueryRunner,
  ) {
    const officerDecrementMap = new Map<
      number,
      { officer: OfficerModel; count: number }
    >();

    changeOfficerMembers.forEach((member) => {
      const officerId = member.officerId as number;
      const existing = officerDecrementMap.get(officerId);

      if (existing) {
        existing.count++;
      } else {
        officerDecrementMap.set(officerId, {
          officer: member.officer,
          count: 1,
        });
      }
    });

    for (const { officer, count } of officerDecrementMap.values()) {
      await this.officersDomainService.decrementMembersCount(
        officer,
        count,
        qr,
      );
    }
  }
}
