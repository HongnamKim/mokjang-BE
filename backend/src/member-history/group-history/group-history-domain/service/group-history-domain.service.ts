import { IGroupHistoryDomainService } from '../interface/group-history-domain.service.interface';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupHistoryModel } from '../../entity/group-history.entity';
import {
  FindOptionsRelations,
  In,
  IsNull,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { MemberModel } from '../../../../members/entity/member.entity';
import { GetGroupHistoryDto } from '../../dto/request/get-group-history.dto';
import { GroupHistoryException } from '../../exception/group-history.exception';
import { GroupModel } from '../../../../management/groups/entity/group.entity';
import { HistoryUpdateDate } from '../../../history-date.utils';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../../../common/const/time-zone.const';

@Injectable()
export class GroupHistoryDomainService implements IGroupHistoryDomainService {
  constructor(
    @InjectRepository(GroupHistoryModel)
    private readonly groupHistoryRepository: Repository<GroupHistoryModel>,
  ) {}

  private getGroupHistoryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(GroupHistoryModel)
      : this.groupHistoryRepository;
  }

  async paginateGroupHistory(
    member: MemberModel,
    dto: GetGroupHistoryDto,
    qr?: QueryRunner,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    return groupHistoryRepository.find({
      where: {
        memberId: member.id,
      },
      relations: {
        group: true,
      },
      order: {
        endDate: dto.orderDirection,
        startDate: dto.orderDirection,
        id: dto.orderDirection,
      },
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
  }

  startGroupHistories(
    members: MemberModel[],
    group: GroupModel,
    startDate: Date,
    qr: QueryRunner,
  ) {
    const repository = this.getGroupHistoryRepository(qr);

    const histories = repository.create(
      members.map((member) => ({
        memberId: member.id,
        groupId: group.id,
        startDate,
      })),
    );

    return repository.save(histories);
  }

  async validateGroupStartDates(
    members: MemberModel[],
    newStartDate: Date,
    qr: QueryRunner,
  ) {
    const memberIds = members.map((m) => m.id);

    const invalidMembers = await qr.manager
      .createQueryBuilder(GroupHistoryModel, 'gh')
      .select(['gh.memberId', 'gh.startDate', 'm.name'])
      .innerJoin('gh.member', 'm')
      .where('gh.memberId IN (:...memberIds)', { memberIds })
      .andWhere('gh.endDate IS NULL')
      .andWhere('gh.startDate > :newStartDate', { newStartDate })
      .andWhere('gh.deletedAt IS NULL')
      .getMany();

    if (invalidMembers.length > 0) {
      const invalidInfo = invalidMembers
        .map(
          (h) =>
            `${h.member.name}(${format(toZonedTime(h.startDate, TIME_ZONE.SEOUL), 'yyyy-MM-dd')})`,
        )
        .join(', ');

      throw new BadRequestException(
        `다음 교인들의 기존 그룹 시작일이 새 그룹 시작일(${format(toZonedTime(newStartDate, TIME_ZONE.SEOUL), 'yyyy-MM-dd')})보다 늦습니다: ${invalidInfo}`,
      );
    }
  }

  async endCurrentGroupHistory(
    member: MemberModel,
    groupSnapShot: string,
    endDate: Date,
    qr: QueryRunner,
  ) {
    const repository = this.getGroupHistoryRepository(qr);

    const currentGroupHistory = await repository.findOne({
      where: {
        memberId: member.id,
        endDate: IsNull(),
      },
    });

    if (!currentGroupHistory) {
      return;
    }

    if (currentGroupHistory.startDate > endDate) {
      throw new BadRequestException(
        `${member.name} 교인의 이전 그룹 시작일과 새로운 그룹 시작일에 오류가 있습니다.`,
      );
    }

    const result = await repository.update(
      {
        id: currentGroupHistory.id,
      },
      {
        groupSnapShot,
        endDate,
        groupId: null,
        group: null,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        GroupHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async endGroupHistories(
    members: MemberModel[],
    endDate: Date,
    qr: QueryRunner,
    group?: GroupModel,
    groupSnapShot?: string,
  ) {
    const repository = this.getGroupHistoryRepository(qr);

    const memberIds = members.map((m) => m.id);

    // 종료할 그룹이 지정되지 않았을 때
    if (!group) {
      const oldHistories = await repository.find({
        where: {
          memberId: In(memberIds),
          endDate: IsNull(),
        },
        relations: {
          group: true,
        },
      });

      oldHistories.forEach((oldHistory) => {
        oldHistory.groupSnapShot = oldHistory.group
          ? oldHistory.group.name
          : '알 수 없는 그룹';
        oldHistory.endDate = endDate;
        oldHistory.groupId = null;
        oldHistory.group = null;
      });

      return repository.save(oldHistories);
    }

    if (!groupSnapShot) {
      throw new InternalServerErrorException();
    }

    const result = await repository.update(
      {
        memberId: In(memberIds),
        groupId: group.id,
        endDate: IsNull(),
      },
      {
        groupSnapShot,
        endDate: endDate,
        groupId: null,
        group: null,
      },
    );

    if (result.affected !== members.length) {
      throw new InternalServerErrorException(
        GroupHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async findCurrentGroupHistoryModel(
    member: MemberModel,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<GroupHistoryModel>,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const history = await groupHistoryRepository.findOne({
      where: {
        memberId: member.id,
        endDate: IsNull(),
      },
      relations: relationOptions,
    });

    if (!history) {
      throw new NotFoundException(GroupHistoryException.NOT_FOUND);
    }

    return history;
  }

  async findGroupHistoryModelById(
    member: MemberModel,
    groupHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<GroupHistoryModel>,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const history = await groupHistoryRepository.findOne({
      where: {
        memberId: member.id,
        id: groupHistoryId,
      },
      relations: relationOptions,
    });

    if (!history) {
      throw new NotFoundException(GroupHistoryException.NOT_FOUND);
    }

    return history;
  }

  private isValidUpdateDate(
    targetHistory: GroupHistoryModel,
    historyDate: HistoryUpdateDate,
  ) {
    // 종료되지 않은 이력의 종료일자 수정
    if (targetHistory.endDate === null && historyDate.endDate) {
      throw new BadRequestException(
        GroupHistoryException.CANNOT_UPDATE_END_DATE,
      );
    }

    // 시작날짜만 수정
    if (historyDate.startDate && !historyDate.endDate) {
      // 시작 날짜가 이력의 종료날짜를 넘음
      if (
        targetHistory.endDate &&
        historyDate.startDate > targetHistory.endDate
      ) {
        throw new BadRequestException(GroupHistoryException.INVALID_START_DATE);
      }
    }

    if (historyDate.endDate && !historyDate.startDate) {
      if (historyDate.endDate < targetHistory.startDate) {
        throw new BadRequestException(GroupHistoryException.INVALID_END_DATE);
      }
    }
  }

  async updateGroupHistory(
    groupHistory: GroupHistoryModel,
    historyDate: HistoryUpdateDate,
    qr: QueryRunner,
  ) {
    this.isValidUpdateDate(groupHistory, historyDate);

    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const result = await groupHistoryRepository.update(
      {
        id: groupHistory.id,
      },
      {
        startDate: historyDate.startDate,
        endDate: historyDate.endDate,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        GroupHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteGroupHistory(
    groupHistory: GroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    if (groupHistory.endDate === null) {
      throw new BadRequestException(GroupHistoryException.CANNOT_DELETE);
    }

    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const result = await groupHistoryRepository.softDelete(groupHistory.id);

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        GroupHistoryException.DELETE_ERROR,
      );
    }

    return result;
  }
}
