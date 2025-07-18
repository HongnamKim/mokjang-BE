import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { MinistryHistoryModel } from '../entity/ministry-history.entity';
import { CreateMemberMinistryDto } from '../dto/ministry/create-member-ministry.dto';
import { EndMemberMinistryDto } from '../dto/ministry/end-member-ministry.dto';
import { GetMinistryHistoryDto } from '../dto/ministry/get-ministry-history.dto';
import { UpdateMinistryHistoryDto } from '../dto/ministry/update-ministry-history.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMINISTRIES_DOMAIN_SERVICE,
  IMinistriesDomainService,
} from '../../management/ministries/ministries-domain/interface/ministries-domain.service.interface';
import {
  IMINISTRY_GROUPS_DOMAIN_SERVICE,
  IMinistryGroupsDomainService,
} from '../../management/ministries/ministries-domain/interface/ministry-groups-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import {
  IMINISTRY_HISTORY_DOMAIN_SERVICE,
  IMinistryHistoryDomainService,
} from '../member-history-domain/interface/ministry-history-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { MinistryHistoryPaginationResultDto } from '../dto/ministry/ministry-history-pagination-result.dto';
import { MinistryHistoryException } from '../exception/ministry-history.exception';

@Injectable()
export class MinistryHistoryService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMINISTRIES_DOMAIN_SERVICE)
    private readonly ministriesDomainService: IMinistriesDomainService,
    @Inject(IMINISTRY_GROUPS_DOMAIN_SERVICE)
    private readonly ministryGroupsDomainService: IMinistryGroupsDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IMINISTRY_HISTORY_DOMAIN_SERVICE)
    private readonly ministryHistoryDomainService: IMinistryHistoryDomainService,
  ) {}

  async getMinistryHistories(
    churchId: number,
    memberId: number,
    dto: GetMinistryHistoryDto,
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

    const { ministryHistories, totalCount } =
      await this.ministryHistoryDomainService.paginateMinistryHistory(
        member,
        dto,
        qr,
      );

    const currentMinistries = ministryHistories.filter(
      (history) => !history.endDate,
    );

    await Promise.all(
      currentMinistries.map(async (history) => {
        const snapShot = await this.createCurrentMinistryGroupSnapShot(
          church,
          history,
          qr,
        );

        history.ministryGroupSnapShot = snapShot.ministryGroupSnapShot;
        history.ministrySnapShot = snapShot.ministrySnapShot;
      }),
    );

    const data = ministryHistories.map((history) =>
      history.endDate === null
        ? { ...history, ministry: null }
        : { ...history },
    );

    return new MinistryHistoryPaginationResultDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );

    /*const output: MinistryHistoryPaginationResult = {
      data,
      totalCount,
      count: data.length,
      page: dto.page,
      totalPage: Math.ceil(totalCount / dto.take),
    };

    return output;*/
  }

  private async createCurrentMinistryGroupSnapShot(
    church: ChurchModel,
    ministryHistory: MinistryHistoryModel,
    qr?: QueryRunner,
  ) {
    if (!ministryHistory.ministry) {
      throw new InternalServerErrorException(
        MinistryHistoryException.RELATION_OPTIONS_ERROR,
      );
    }

    const ministryGroupId = ministryHistory.ministry.ministryGroupId;

    const ministryParentGroups = ministryGroupId
      ? await this.ministryGroupsDomainService.findParentMinistryGroups(
          church,
          ministryGroupId,
          qr,
        )
      : [];

    const ministryGroupSnapShot = ministryParentGroups
      .map((ministryParentGroup) => ministryParentGroup.name)
      .concat(ministryHistory.ministry.ministryGroup?.name)
      .join('__');

    return {
      ministryGroupSnapShot: ministryGroupSnapShot
        ? ministryGroupSnapShot
        : null,
      ministrySnapShot: ministryHistory.ministry.name,
    };
  }

  async createMemberMinistry(
    churchId: number,
    memberId: number,
    dto: CreateMemberMinistryDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const [member, ministry] = await Promise.all([
      this.membersDomainService.findMemberModelById(church, memberId, qr, {
        ministries: true,
      }),
      this.ministriesDomainService.findMinistryModelById(
        church,
        dto.ministryId,
        qr,
        { ministryGroup: true },
      ),
    ]);

    const [newMinistryHistory] = await Promise.all([
      // 사역 이력 생성
      this.ministryHistoryDomainService.createMinistryHistory(
        member,
        ministry,
        dto.startDate,
        qr,
      ),

      // 인원 수 증가
      this.ministriesDomainService.incrementMembersCount(ministry, qr),
      // 사역 relation 추가
      this.membersDomainService.startMemberMinistry(member, ministry, qr),
    ]);

    const snapShot = await this.createCurrentMinistryGroupSnapShot(
      church,
      newMinistryHistory,
      qr,
    );

    newMinistryHistory.ministrySnapShot = snapShot.ministrySnapShot;
    newMinistryHistory.ministryGroupSnapShot = snapShot.ministryGroupSnapShot;

    return {
      ...newMinistryHistory,
      member: undefined,
      ministry: null,
    };
  }

  async endMemberMinistry(
    churchId: number,
    memberId: number,
    ministryHistoryId: number,
    dto: EndMemberMinistryDto,
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
      { ministries: true },
    );

    const ministryHistory =
      await this.ministryHistoryDomainService.findMinistryHistoryModelById(
        member,
        ministryHistoryId,
        qr,
        { ministry: { ministryGroup: true } },
      );

    if (!ministryHistory.ministry) {
      throw new InternalServerErrorException(
        MinistryHistoryException.RELATION_OPTIONS_ERROR,
      );
    }

    if (ministryHistory.startDate > dto.endDate) {
      throw new BadRequestException(MinistryHistoryException.INVALID_END_DATE);
    }

    const snapShot = await this.createCurrentMinistryGroupSnapShot(
      church,
      ministryHistory,
      qr,
    );

    await Promise.all([
      // 사역 이력 종료 날짜 추가
      this.ministryHistoryDomainService.endMinistryHistory(
        ministryHistory,
        snapShot,
        dto.endDate,
        qr,
      ),
      // 교인 - 사역 관계 해제
      this.membersDomainService.endMemberMinistry(
        member,
        ministryHistory.ministry,
        qr,
      ),
      // 사역 인원수 감소
      this.ministriesDomainService.decrementMembersCount(
        ministryHistory.ministry,
        qr,
      ),
    ]);

    return this.ministryHistoryDomainService.findMinistryHistoryModelById(
      member,
      ministryHistoryId,
      qr,
    );
  }

  async updateMinistryHistory(
    churchId: number,
    memberId: number,
    ministryHistoryId: number,
    dto: UpdateMinistryHistoryDto,
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
      await this.ministryHistoryDomainService.findMinistryHistoryModelById(
        member,
        ministryHistoryId,
        qr,
      );

    // 날짜 검증
    await this.ministryHistoryDomainService.updateMinistryHistory(
      targetHistory,
      dto,
      qr,
    );

    const updatedHistory =
      await this.ministryHistoryDomainService.findMinistryHistoryModelById(
        member,
        ministryHistoryId,
        qr,
        {
          ministry: {
            ministryGroup: true,
          },
        },
      );

    if (updatedHistory.endDate) {
      return updatedHistory;
    } else {
      const snapShot = await this.createCurrentMinistryGroupSnapShot(
        church,
        updatedHistory,
        qr,
      );

      updatedHistory.ministrySnapShot = snapShot.ministrySnapShot;
      updatedHistory.ministryGroupSnapShot = snapShot.ministryGroupSnapShot;

      return { ...updatedHistory, ministry: null };
    }
  }

  async deleteMinistryHistory(
    churchId: number,
    memberId: number,
    ministryHistoryId: number,
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
      await this.ministryHistoryDomainService.findMinistryHistoryModelById(
        member,
        ministryHistoryId,
        qr,
      );

    await this.ministryHistoryDomainService.deleteMinistryHistory(
      targetHistory,
      qr,
    );

    return `ministryHistoryId ${ministryHistoryId} deleted`;
  }
}
