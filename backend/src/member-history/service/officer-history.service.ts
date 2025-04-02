import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetOfficerHistoryDto } from '../dto/officer/get-officer-history.dto';
import { SetMemberOfficerDto } from '../dto/officer/set-member-officer.dto';
import { EndMemberOfficeDto } from '../dto/officer/end-member-officer.dto';
import { UpdateOfficerHistoryDto } from '../dto/officer/update-officer-history.dto';
import {
  IOFFICERS_DOMAIN_SERVICE,
  IOfficersDomainService,
} from '../../management/officers/officer-domain/interface/officers-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/service/interface/members-domain.service.interface';
import {
  IOFFICER_HISTORY_DOMAIN_SERVICE,
  IOfficerHistoryDomainService,
} from '../member-history-domain/service/interface/officer-history-domain.service.interface';
import { OfficerHistoryPaginationResultDto } from '../dto/officer/officer-history-pagination-result.dto';
import { OfficerHistoryException } from '../const/exception/officer-history.exception';

@Injectable()
export class OfficerHistoryService {
  constructor(
    @Inject(IOFFICERS_DOMAIN_SERVICE)
    private readonly officersDomainService: IOfficersDomainService,
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IOFFICER_HISTORY_DOMAIN_SERVICE)
    private readonly officerHistoryDomainService: IOfficerHistoryDomainService,
  ) {}

  async getMemberOfficerHistory(
    churchId: number,
    memberId: number,
    dto: GetOfficerHistoryDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
    );

    const { officerHistories, totalCount } =
      await this.officerHistoryDomainService.paginateOfficerHistory(
        church,
        member,
        dto,
        qr,
      );

    // snapshot 처리 되지 않은 이력(현재 이력)의 포맷을 다른 이력들과 통일 시킴
    const filteredData = officerHistories.map((history) =>
      history.endDate === null && history.officer
        ? { ...history, officerSnapShot: history.officer.name, officer: null }
        : history,
    );

    const totalPage = Math.ceil(totalCount / dto.take);

    const result: OfficerHistoryPaginationResultDto = {
      data: filteredData,
      totalCount,
      count: filteredData.length,
      page: dto.page,
      totalPage,
    };

    return result;
  }

  async setMemberOfficer(
    churchId: number,
    memberId: number,
    dto: SetMemberOfficerDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
      { officer: true, church: true },
    );

    if (member.officer) {
      throw new ConflictException(OfficerHistoryException.ALREADY_EXIST);
    }

    const officer = await this.officersDomainService.findOfficerModelById(
      church,
      dto.officerId,
      qr,
    );

    const officerStartChurch = dto.officerStartChurch
      ? dto.officerStartChurch
      : member.church.name;

    const [newHistory] = await Promise.all([
      // 직분 이력 생성
      this.officerHistoryDomainService.createOfficerHistory(
        member,
        officer,
        dto.startDate,
        officerStartChurch,
        qr,
      ),

      // 직분 인원수 증가
      this.officersDomainService.incrementMembersCount(officer, qr),

      // 교인 - 직분 관계 설정
      this.membersDomainService.startMemberOfficer(
        member,
        officer,
        dto.startDate,
        officerStartChurch,
        qr,
      ),
    ]);

    newHistory.officerSnapShot = officer.name;
    newHistory.officer = null;

    return newHistory;
  }

  async endMemberOfficer(
    churchId: number,
    memberId: number,
    dto: EndMemberOfficeDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
      { officer: true },
    );

    const officerHistory =
      await this.officerHistoryDomainService.findCurrentOfficerHistoryModel(
        member,
        qr,
        { officer: true },
      );

    await Promise.all([
      // 직분 이력 종료날짜, 스냅샷 기록
      this.officerHistoryDomainService.endOfficerHistory(
        officerHistory,
        dto.endDate,
        qr,
      ),

      // 교인 - 직분 관계 해제
      this.membersDomainService.endMemberOfficer(member, qr),

      // 직분의 membersCount 감소
      this.officersDomainService.decrementMembersCount(member.officer, qr),
    ]);

    return this.officerHistoryDomainService.findOfficerHistoryModelById(
      member,
      officerHistory.id,
      qr,
      { officer: true },
    );
  }

  async updateOfficerHistory(
    churchId: number,
    memberId: number,
    officerHistoryId: number,
    dto: UpdateOfficerHistoryDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
    );

    const targetHistory =
      await this.officerHistoryDomainService.findOfficerHistoryModelById(
        member,
        officerHistoryId,
        qr,
      );

    await this.officerHistoryDomainService.updateOfficerHistory(
      targetHistory,
      dto,
      qr,
    );

    return this.officerHistoryDomainService.findOfficerHistoryModelById(
      member,
      officerHistoryId,
      qr,
      { officer: true },
    );
  }

  async deleteOfficerHistory(
    churchId: number,
    memberId: number,
    officerHistoryId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
    );
    const targetHistory =
      await this.officerHistoryDomainService.findOfficerHistoryModelById(
        member,
        officerHistoryId,
        qr,
      );

    await this.officerHistoryDomainService.deleteOfficerHistory(
      targetHistory,
      qr,
    );

    return `officerHistoryId ${officerHistoryId} deleted`;
  }
}
