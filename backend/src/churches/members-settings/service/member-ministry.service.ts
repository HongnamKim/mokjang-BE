import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from '../../members/service/members.service';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { MinistryService } from '../../settings/service/ministry/ministry.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryHistoryModel } from '../entity/ministry-history.entity';
import { CreateMemberMinistryDto } from '../dto/ministry/create-member-ministry.dto';
import { DefaultMemberRelationOption } from '../../members/const/default-find-options.const';
import { EndMemberMinistryDto } from '../dto/ministry/end-member-ministry.dto';
import { MinistryGroupService } from '../../settings/service/ministry/ministry-group.service';
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

    // 현재 사역 조회
    const ministryHistories = await ministryHistoryRepository.find({
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
    });

    return Promise.all(
      ministryHistories.map(async (ministryHistory) => {
        if (ministryHistory.endDate) {
          return { ...ministryHistory /*, ministry: null */ };
        }

        const ministryGroupId = ministryHistory.ministry.ministryGroupId;

        const ministryParentGroups = ministryGroupId
          ? await this.ministryGroupService.getParentMinistryGroups(
              churchId,
              ministryGroupId,
              qr,
            )
          : [];

        const ministrySnapShot = ministryHistory.ministry.name;
        const ministryGroupSnapShot = ministryParentGroups
          .map((ministryParentGroup) => ministryParentGroup.name)
          .concat(ministryHistory.ministry.ministryGroup?.name)
          .join('__');

        ministryHistory.ministrySnapShot = ministrySnapShot;
        ministryHistory.ministryGroupSnapShot = ministryGroupSnapShot;

        return {
          ...ministryHistory,
          ministry: null,
        };
      }),
    );
  }

  async createMemberMinistry(
    churchId: number,
    memberId: number,
    dto: CreateMemberMinistryDto,
    qr: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    // 등록하려는 사역이 해당 교회에 존재하는지
    // 등록하려는 사역이 해당 교인에게 없는지 (이미 있는 사역 재등록 방지)
    // 교인이 교회에 존재하는지
    const ministry = await this.ministryService.getMinistryModelById(
      churchId,
      dto.ministryId,
      { ministryGroup: true },
      qr,
    );

    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      { ministries: true },
      qr,
    );

    const ministryHistory = await ministryHistoryRepository.findOne({
      where: {
        memberId,
        ministryId: dto.ministryId,
        endDate: IsNull(),
      },
    });

    if (ministryHistory) {
      throw new BadRequestException('이미 부여된 사역입니다.');
    }

    if (dto.startDate > new Date()) {
      throw new BadRequestException(
        '사역의 시작 날짜는 현재 날짜를 앞설 수 없습니다.',
      );
    }

    // 사역 이력 생성
    await ministryHistoryRepository.save({
      member,
      ministry,
      ministryGroupId: ministry.ministryGroupId,
      startDate: dto.startDate,
    });

    // 인원 수 증가
    await this.ministryService.incrementMembersCount(
      churchId,
      dto.ministryId,
      qr,
    );

    // 사역 relation 추가
    await this.membersService.addMemberMinistry(member, ministry, qr);

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
        memberId,
        ministryId,
      },
    });

    if (!ministryHistory) {
      throw new NotFoundException('부여되지 않은 사역을 삭제할 수 없습니다.');
    }

    if (dto.endDate > new Date()) {
      throw new BadRequestException(
        '사역의 종료 날짜는 현재 날짜를 앞설 수 없습니다.',
      );
    }

    dto.endDate.setHours(23, 59, 59, 99);

    if (ministryHistory.startDate > dto.endDate) {
      throw new BadRequestException('사역 종료일이 시작일을 앞설 수 없습니다.');
    }

    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      { ministries: true },
      qr,
    );
    const ministry = await this.ministryService.getMinistryModelById(
      churchId,
      ministryId,
      { ministryGroup: true },
      qr,
    );

    const ministryParentGroups = ministry.ministryGroupId
      ? await this.ministryGroupService.getParentMinistryGroups(
          churchId,
          ministry.ministryGroupId,
          qr,
        )
      : [];

    const ministryGroupSnapShot = ministryParentGroups
      .map((ministryParentGroup) => ministryParentGroup.name)
      .concat(ministry.ministryGroup.name)
      .join('__');

    // 사역 이력 종료 날짜 추가
    await ministryHistoryRepository.update(
      { memberId, ministryId },
      {
        ministryId: null,
        ministrySnapShot: ministry.name,
        ministryGroupSnapShot,
        endDate: dto.endDate,
      },
    );

    // N:N relation 해제
    await this.membersService.removeMemberMinistry(member, ministry, qr);

    await this.ministryService.decrementMembersCount(churchId, ministryId, qr);

    return this.membersService.getMemberById(
      churchId,
      memberId,
      DefaultMemberRelationOption,
      qr,
    );
  }

  /*async getMinistryHistory(
    churchId: number,
    memberId: number,
    dto: GetMinistryHistoryDto,
    qr?: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    return ministryHistoryRepository.find({
      where: {
        member: {
          churchId,
        },
        memberId,
        endDate: Not(IsNull()),
      },
      order: {
        endDate: dto.orderDirection,
        startDate: dto.orderDirection,
        id: dto.orderDirection,
      },
    });
  }*/

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
        //endDate: Not(IsNull()),
      },
    });

    if (!targetHistory) {
      throw new NotFoundException('해당 사역 이력을 찾을 수 없습니다.');
    }

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
        //endDate: Not(IsNull()),
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

  /*async updateMemberMinistry(
    churchId: number,
    memberId: number,
    dto: UpdateMemberMinistryDto,
    qr: QueryRunner,
  ) {
    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      { ministries: true, church: true },
      qr,
    );

    const ministryIds = member.ministries.map((ministry) => ministry.id);

    if (!dto.isDeleteMinistry && ministryIds.includes(dto.ministryId)) {
      throw new BadRequestException('이미 부여된 사역입니다.');
    }

    if (dto.isDeleteMinistry && !ministryIds.includes(dto.ministryId)) {
      throw new BadRequestException('부여되지 않은 사역을 삭제할 수 없습니다.');
    }

    const ministry = await this.settingsService.getSettingValueById(
      churchId,
      dto.ministryId,
      MinistryModel,
      qr,
    );

    await this.membersService.updateMemberMinistry(member, dto, ministry, qr);

    if (dto.isDeleteMinistry) {
      await this.ministryService.decrementMembersCount(
        churchId,
        dto.ministryId,
        qr,
      );
    } else {
      await this.ministryService.incrementMembersCount(
        churchId,
        dto.ministryId,
        qr,
      );
    }

    return this.membersService.getMemberById(
      churchId,
      memberId,
      { ministries: true },
      qr,
    );
  }*/
}
