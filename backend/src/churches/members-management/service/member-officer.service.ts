import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from '../../members/service/members.service';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OfficerHistoryModel } from '../entity/officer-history.entity';
import { GetOfficerHistoryDto } from '../dto/officer/get-officer-history.dto';
import { SetMemberOfficerDto } from '../dto/officer/set-member-officer.dto';
import { EndMemberOfficeDto } from '../dto/officer/end-member-officer.dto';
import { UpdateOfficerHistoryDto } from '../dto/officer/update-officer-history.dto';
import {
  IOFFICERS_DOMAIN_SERVICE,
  IOfficersDomainService,
} from '../../../management/officers/officer-domain/interface/officers-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches-domain/interface/churches-domain.service.interface';

@Injectable()
export class MemberOfficerService {
  constructor(
    @InjectRepository(OfficerHistoryModel)
    private readonly officerHistoryRepository: Repository<OfficerHistoryModel>,
    private readonly membersService: MembersService,

    @Inject(IOFFICERS_DOMAIN_SERVICE)
    private readonly officersDomainService: IOfficersDomainService,
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
  ) {}

  private getOfficerHistoryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(OfficerHistoryModel)
      : this.officerHistoryRepository;
  }

  async getMemberOfficerHistory(
    churchId: number,
    memberId: number,
    dto: GetOfficerHistoryDto,
    qr?: QueryRunner,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const [officerHistories, totalCount] = await Promise.all([
      officerHistoryRepository.find({
        where: {
          member: {
            churchId,
          },
          memberId,
        },
        relations: { officer: true },
        order: {
          startDate: dto.orderDirection,
          id: dto.orderDirection,
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      officerHistoryRepository.count({
        where: {
          member: {
            churchId,
          },
          memberId,
        },
      }),
    ]);

    const result = officerHistories.map((history) =>
      history.endDate === null
        ? { ...history, officerSnapShot: history.officer.name, officer: null }
        : history,
    );

    return {
      data: result,
      totalCount,
      count: result.length,
      page: dto.page,
    };
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

    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      { officer: true, church: true },
      qr,
    );

    if (member.officer) {
      throw new BadRequestException('직분이 있는 교인입니다.');
    }

    const officer = await this.officersDomainService.findOfficerModelById(
      church,
      dto.officerId,
      qr,
    );

    const officerStartChurch = dto.officerStartChurch
      ? dto.officerStartChurch
      : member.church.name;

    await Promise.all([
      // 직분 이력 생성
      officerHistoryRepository.save({
        member,
        officer,
        startDate: dto.startDate,
        officerStartChurch,
      }),

      // 직분 인원수 증가
      this.officersDomainService.incrementMembersCount(officer, qr),

      // 교인 - 직분 관계 설정
      this.membersService.startMemberOfficer(
        member,
        officer,
        dto.startDate,
        officerStartChurch,
        qr,
      ),
    ]);

    return this.membersService.getMemberById(churchId, memberId, qr);
  }

  async endMemberOfficer(
    churchId: number,
    memberId: number,
    dto: EndMemberOfficeDto,
    qr: QueryRunner,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const officerHistory = await officerHistoryRepository.findOne({
      where: {
        member: {
          churchId,
        },
        memberId,
        endDate: IsNull(),
      },
      relations: {
        member: { officer: true },
        officer: true,
      },
    });

    if (!officerHistory) {
      throw new NotFoundException('직분이 없는 교인입니다.');
    }

    if (officerHistory.startDate > dto.endDate) {
      throw new BadRequestException('직분 종료일이 시작일을 앞설 수 없습니다.');
    }

    const { member } = officerHistory;

    const officerSnapShot = officerHistory.officer.name;

    await Promise.all([
      // 직분 이력 종료날짜, 스냅샷 기록
      officerHistoryRepository.update(
        { id: officerHistory.id },
        {
          officerId: null,
          officerSnapShot,
          endDate: dto.endDate,
        },
      ),

      // 교인 - 직분 관계 해제
      this.membersService.endMemberOfficer(member, qr),

      // 직분의 membersCount 감소
      this.officersDomainService.decrementMembersCount(
        officerHistory.officer,
        qr,
      ),
    ]);

    return this.membersService.getMemberById(churchId, memberId, qr);
  }

  private isValidUpdateDate(
    targetHistory: OfficerHistoryModel,
    dto: UpdateOfficerHistoryDto,
  ) {
    // 종료되지 않은 이력의 종료 날짜 수정
    if (targetHistory.endDate === null && dto.endDate) {
      throw new BadRequestException(
        '종료되지 않은 직분의 종료 날짜를 수정할 수 없습니다.',
      );
    }

    // 시작 날짜만 수정
    if (dto.startDate && !dto.endDate) {
      // 종료된 이력의 시작일 수정 시 시작일이 기존 종료일보다 늦을 경우
      if (targetHistory.endDate && dto.startDate > targetHistory.endDate) {
        throw new BadRequestException(
          '이력 시작일은 종료일보다 늦을 수 없습니다.',
        );
      }
    }

    // 종료 날짜만 수정
    if (dto.endDate && !dto.startDate) {
      if (dto.endDate < targetHistory.startDate) {
        throw new BadRequestException(
          '이력 종료일은 시작일보다 빠를 수 없습니다.',
        );
      }
    }
  }

  async updateOfficerHistory(
    churchId: number,
    memberId: number,
    officerHistoryId: number,
    dto: UpdateOfficerHistoryDto,
    qr: QueryRunner,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const targetHistory = await officerHistoryRepository.findOne({
      where: {
        member: {
          churchId,
        },
        memberId,
        id: officerHistoryId,
      },
    });

    if (!targetHistory) {
      throw new NotFoundException('해당 직분 이력을 찾을 수 없습니다.');
    }

    this.isValidUpdateDate(targetHistory, dto);

    await officerHistoryRepository.update(
      {
        id: targetHistory.id,
      },
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    );

    return officerHistoryRepository.findOne({
      where: { id: targetHistory.id },
      relations: { officer: true },
    });
  }

  async deleteOfficerHistory(
    churchId: number,
    memberId: number,
    officerHistoryId: number,
    qr?: QueryRunner,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const targetHistory = await officerHistoryRepository.findOne({
      where: {
        id: officerHistoryId,
        member: {
          churchId,
        },
        memberId,
      },
    });

    if (!targetHistory) {
      throw new NotFoundException('해당 직분 이력을 찾을 수 없습니다.');
    }

    if (targetHistory.endDate === null) {
      throw new BadRequestException('종료되지 않은 이력을 삭제할 수 없습니다.');
    }

    await officerHistoryRepository.softDelete(targetHistory.id);

    return `officerHistoryId ${officerHistoryId} deleted`;
  }
}
