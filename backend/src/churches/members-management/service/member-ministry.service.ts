import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from '../../members/service/members.service';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { MinistryService } from '../../management/service/ministry/ministry.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryHistoryModel } from '../entity/ministry-history.entity';
import { CreateMemberMinistryDto } from '../dto/ministry/create-member-ministry.dto';
import { DefaultMemberRelationOption } from '../../members/const/default-find-options.const';
import { EndMemberMinistryDto } from '../dto/ministry/end-member-ministry.dto';
import { MinistryGroupService } from '../../management/service/ministry/ministry-group.service';
import { GetMinistryHistoryDto } from '../dto/ministry/get-ministry-history.dto';
import { UpdateMinistryHistoryDto } from '../dto/ministry/update-ministry-history.dto';

@Injectable()
export class MemberMinistryService {
  constructor(
    private readonly membersService: MembersService,
    private readonly ministryService: MinistryService,
    private readonly ministryGroupService: MinistryGroupService,
    @InjectRepository(MinistryHistoryModel)
    private readonly ministryHistoryRepository: Repository<MinistryHistoryModel>,
  ) {}

  private getMinistryHistoryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryHistoryModel)
      : this.ministryHistoryRepository;
  }

  async getCurrentMemberMinistry(
    churchId: number,
    memberId: number,
    dto: GetMinistryHistoryDto,
    qr?: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const [ministryHistories, totalCount] = await Promise.all([
      ministryHistoryRepository.find({
        where: {
          member: {
            churchId,
          },
          memberId,
        },
        relations: {
          ministry: {
            ministryGroup: true,
          },
        },
        order: {
          endDate: dto.orderDirection,
          startDate: dto.orderDirection,
          id: dto.orderDirection,
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      ministryHistoryRepository.count({
        where: {
          member: {
            churchId,
          },
          memberId,
        },
      }),
    ]);

    const currentHistories = ministryHistories.filter(
      (history) => !history.endDate,
    );

    await Promise.all(
      currentHistories.map(async (history) => {
        const snapShot = await this.createCurrentMinistryGroupSnapShot(
          churchId,
          history,
          qr,
        );

        history.ministryGroupSnapShot = snapShot.ministryGroupSnapShot;
        history.ministrySnapShot = snapShot.ministrySnapShot;
      }),
    );

    const result = ministryHistories.map((history) =>
      history.endDate === null
        ? { ...history, ministry: null }
        : { ...history },
    );

    return {
      data: result,
      totalCount,
      count: result.length,
      page: dto.page,
    };
  }

  private async createCurrentMinistryGroupSnapShot(
    churchId: number,
    ministryHistory: MinistryHistoryModel,
    qr?: QueryRunner,
  ) {
    const ministryGroupId = ministryHistory.ministry.ministryGroupId;

    const ministryParentGroups = ministryGroupId
      ? await this.ministryGroupService.getParentMinistryGroups(
          churchId,
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

  private async isExistMinistryHistory(
    churchId: number,
    memberId: number,
    ministryId: number,
    qr?: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const ministryHistory = await ministryHistoryRepository.findOne({
      where: {
        member: { churchId },
        memberId,
        ministryId,
        endDate: IsNull(),
      },
    });

    return !!ministryHistory;
  }

  async createMemberMinistry(
    churchId: number,
    memberId: number,
    dto: CreateMemberMinistryDto,
    qr: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const [ministry, member, isExistMinistryHistory] = await Promise.all([
      this.ministryService.getMinistryModelById(
        churchId,
        dto.ministryId,
        { ministryGroup: true },
        qr,
      ),
      this.membersService.getMemberModelById(
        churchId,
        memberId,
        { ministries: true },
        qr,
      ),
      this.isExistMinistryHistory(churchId, memberId, dto.ministryId, qr),
    ]);

    if (isExistMinistryHistory) {
      throw new BadRequestException('이미 부여된 사역입니다.');
    }

    await Promise.all([
      // 사역 이력 생성
      ministryHistoryRepository.save({
        member,
        ministry,
        startDate: dto.startDate,
      }),
      // 인원 수 증가
      this.ministryService.incrementMembersCount(churchId, dto.ministryId, qr),
      // 사역 relation 추가
      this.membersService.addMemberMinistry(member, ministry, qr),
    ]);

    return this.membersService.getMemberById(
      churchId,
      memberId,
      DefaultMemberRelationOption,
      qr,
    );
  }

  async endMemberMinistry(
    churchId: number,
    memberId: number,
    ministryId: number,
    dto: EndMemberMinistryDto,
    qr: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const ministryHistory = await ministryHistoryRepository.findOne({
      where: {
        member: {
          churchId,
        },
        memberId,
        ministryId,
      },
      relations: {
        member: {
          ministries: true,
        },
        ministry: {
          ministryGroup: true,
        },
      },
    });

    if (!ministryHistory) {
      throw new NotFoundException('부여되지 않은 사역을 삭제할 수 없습니다.');
    }

    if (ministryHistory.startDate > dto.endDate) {
      throw new BadRequestException('사역 종료일이 시작일을 앞설 수 없습니다.');
    }

    const snapShot = await this.createCurrentMinistryGroupSnapShot(
      churchId,
      ministryHistory,
      qr,
    );

    await Promise.all([
      // 사역 이력 종료 날짜 추가
      ministryHistoryRepository.update(
        { memberId, ministryId },
        {
          ministryId: null,
          ministrySnapShot: snapShot.ministrySnapShot, //ministry.name,
          ministryGroupSnapShot: snapShot.ministryGroupSnapShot,
          endDate: dto.endDate,
        },
      ),
      // 교인 - 사역 관계 해제
      this.membersService.removeMemberMinistry(
        ministryHistory.member,
        ministryHistory.ministry,
        qr,
      ),
      // 사역 인원수 감소
      this.ministryService.decrementMembersCount(churchId, ministryId, qr),
    ]);

    return this.membersService.getMemberById(
      churchId,
      memberId,
      DefaultMemberRelationOption,
      qr,
    );
  }

  private isValidUpdateDate(
    targetHistory: MinistryHistoryModel,
    dto: UpdateMinistryHistoryDto,
  ) {
    if (targetHistory.endDate === null && dto.endDate) {
      throw new BadRequestException(
        '종료되지 않은 사역의 종료 날짜를 수정할 수 없습니다.',
      );
    }

    // 시작일 변경하는 경우 --> 새로운 시작일이 종료일보다 앞에 있어야함
    // 종료일 변경하는 경우 --> 새로운 종료일이 시작일보다 뒤에 있어야함
    // 시작일,종료일 변경하는 경우 --> DTO 에서 검증

    if (dto.startDate && !dto.endDate) {
      if (targetHistory.endDate && dto.startDate > targetHistory.endDate) {
        throw new BadRequestException(
          '이력 시작일은 종료일보다 늦을 수 없습니다.',
        );
      }
    }

    if (dto.endDate && !dto.startDate) {
      if (dto.endDate < targetHistory.startDate) {
        throw new BadRequestException(
          '이력 종료일은 시작일보다 빠를 수 없습니다.',
        );
      }
    }
  }

  async updateMinistryHistory(
    churchId: number,
    memberId: number,
    ministryHistoryId: number,
    dto: UpdateMinistryHistoryDto,
    qr?: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const targetHistory = await ministryHistoryRepository.findOne({
      where: {
        member: {
          churchId,
        },
        memberId,
        id: ministryHistoryId,
      },
    });

    if (!targetHistory) {
      throw new NotFoundException('해당 사역 이력을 찾을 수 없습니다.');
    }

    // 날짜 검증
    this.isValidUpdateDate(targetHistory, dto);

    await ministryHistoryRepository.update(
      { id: ministryHistoryId },
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    );

    return ministryHistoryRepository.findOne({
      where: { id: ministryHistoryId },
    });
  }

  async deleteMinistryHistory(
    churchId: number,
    memberId: number,
    ministryHistoryId: number,
    qr?: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const targetHistory = await ministryHistoryRepository.findOne({
      where: {
        id: ministryHistoryId,
        member: {
          churchId,
        },
        memberId,
      },
    });

    if (!targetHistory) {
      throw new NotFoundException('해당 사역 이력을 찾을 수 없습니다.');
    }

    if (targetHistory.endDate === null) {
      throw new BadRequestException('종료되지 않은 이력을 삭제할 수 없습니다.');
    }

    await ministryHistoryRepository.softDelete(targetHistory.id);

    return `ministryHistoryId ${ministryHistoryId} deleted`;
  }
}
