import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetOfficerHistoryDto } from '../dto/request/get-officer-history.dto';
import { UpdateOfficerHistoryDto } from '../dto/request/update-officer-history.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import {
  IOFFICER_HISTORY_DOMAIN_SERVICE,
  IOfficerHistoryDomainService,
} from '../officer-history-domain/interface/officer-history-domain.service.interface';
import { OfficerHistoryPaginationResultDto } from '../dto/officer-history-pagination-result.dto';
import { convertHistoryDate } from '../../history-date.utils';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { PatchOfficerHistoryResponseDto } from '../dto/reponse/patch-officer-history-response.dto';
import { DeleteOfficerHistoryResponseDto } from '../dto/reponse/delete-officer-history-response.dto';

@Injectable()
export class OfficerHistoryService {
  constructor(
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

    const officerHistories =
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

    return new OfficerHistoryPaginationResultDto(filteredData);
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
        { officer: true },
      );

    const historyDateUpdateValue = convertHistoryDate(
      dto.startDate,
      dto.endDate,
      TIME_ZONE.SEOUL,
    );

    await this.officerHistoryDomainService.updateOfficerHistory(
      targetHistory,
      historyDateUpdateValue,
      qr,
    );

    // 응답
    if (historyDateUpdateValue.startDate) {
      targetHistory.startDate = historyDateUpdateValue.startDate;
    }
    if (historyDateUpdateValue.endDate) {
      targetHistory.endDate = historyDateUpdateValue.endDate;
    }

    if (!targetHistory.endDate) {
      targetHistory.officerSnapShot = targetHistory.officer
        ? targetHistory.officer.name
        : '알 수 없는 직분';

      targetHistory.officer = null;
    }

    return new PatchOfficerHistoryResponseDto(targetHistory);
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

    return new DeleteOfficerHistoryResponseDto(
      new Date(),
      targetHistory.id,
      true,
    );
  }

  /*async setMemberOfficer(
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
      this.officersDomainService.incrementMembersCount(officer, 1, qr),

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
      this.officersDomainService.decrementMembersCount(member.officer, 1, qr),
    ]);

    return this.officerHistoryDomainService.findOfficerHistoryModelById(
      member,
      officerHistory.id,
      qr,
      { officer: true },
    );
  }*/
}
