import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IGroupDetailHistoryDomainService } from '../interface/group-detail-history-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupDetailHistoryModel } from '../../entity/group-detail-history.entity';
import {
  In,
  IsNull,
  MoreThan,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { MemberModel } from '../../../../members/entity/member.entity';
import { GroupHistoryModel } from '../../entity/group-history.entity';
import { GroupHistoryException } from '../../exception/group-history.exception';
import { GroupRole } from '../../../../management/groups/const/group-role.enum';
import { GetGroupHistoryDto } from '../../dto/request/get-group-history.dto';
import { GroupDetailHistoryException } from '../../exception/group-detail-history.exception';
import { HistoryUpdateDate } from '../../../history-date.utils';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../../../common/const/time-zone.const';

@Injectable()
export class GroupDetailHistoryDomainService
  implements IGroupDetailHistoryDomainService
{
  constructor(
    @InjectRepository(GroupDetailHistoryModel)
    private readonly repository: Repository<GroupDetailHistoryModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(GroupDetailHistoryModel)
      : this.repository;
  }

  paginateDetailHistories(
    groupHistory: GroupHistoryModel,
    dto: GetGroupHistoryDto,
    qr?: QueryRunner,
  ): Promise<GroupDetailHistoryModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        groupHistoryId: groupHistory.id,
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

  async findGroupDetailHistoryModelById(
    groupHistory: GroupHistoryModel,
    detailId: number,
    qr?: QueryRunner,
  ): Promise<GroupDetailHistoryModel> {
    const repository = this.getRepository(qr);

    const history = await repository.findOne({
      where: {
        id: detailId,
        groupHistoryId: groupHistory.id,
      },
    });

    if (!history) {
      throw new NotFoundException(GroupDetailHistoryException.NOT_FOUND);
    }

    return history;
  }

  async findCurrentGroupDetailHistory(
    member: MemberModel,
    groupHistory: GroupHistoryModel,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const history = await repository.findOne({
      where: {
        groupHistoryId: groupHistory.id,
        memberId: member.id,
        endDate: IsNull(),
      },
    });

    if (!history) {
      throw new NotFoundException(
        GroupDetailHistoryException.NOT_FOUND_CURRENT_DETAIL,
      );
    }

    return history;
  }

  startGroupDetailHistory(
    member: MemberModel,
    groupHistory: GroupHistoryModel,
    groupRole: GroupRole,
    startDate: Date,
    qr?: QueryRunner,
  ) {
    if (startDate < groupHistory.startDate) {
      throw new BadRequestException(
        GroupDetailHistoryException.INVALID_DETAIL_START_DATE,
      );
    }

    const repository = this.getRepository(qr);

    return repository.save({
      member: { id: member.id },
      groupHistory: { id: groupHistory.id },
      role: groupRole,
      startDate: startDate,
    });
  }

  async validateGroupRoleEndDates(
    leaderMembers: MemberModel[],
    endDate: Date,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const leaderMemberIds = leaderMembers.map((m) => m.id);

    const invalidHistories = await repository.find({
      where: {
        memberId: In(leaderMemberIds),
        role: GroupRole.LEADER,
        endDate: IsNull(),
        startDate: MoreThan(endDate),
      },
      relations: {
        member: true,
      },
    });

    if (invalidHistories.length > 0) {
      const invalidInfos = invalidHistories
        .map(
          (h) =>
            `${h.member.name}(${format(toZonedTime(h.startDate, TIME_ZONE.SEOUL), 'yyyy-MM-dd')})`,
        )
        .join(', ');

      throw new BadRequestException(
        `다음 교인들의 기존 그룹 리더 시작일이 종료일(${format(toZonedTime(endDate, TIME_ZONE.SEOUL), 'yyyy-MM-dd')})보다 늦습니다: ${invalidInfos}`,
      );
    }
  }

  async endGroupDetailHistory(
    members: MemberModel[],
    endDate: Date,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const memberIds = members.map((m) => m.id);

    const result = await repository.update(
      {
        memberId: In(memberIds),
        endDate: IsNull(),
      },
      {
        endDate: endDate,
      },
    );

    if (result.affected !== members.length) {
      throw new InternalServerErrorException(
        GroupHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async updateDetailHistory(
    targetHistory: GroupDetailHistoryModel,
    historyDate: HistoryUpdateDate,
    qr: QueryRunner | undefined,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    this.validateUpdateDate(targetHistory, historyDate);

    const result = await repository.update(
      { id: targetHistory.id },
      { startDate: historyDate.startDate, endDate: historyDate.endDate },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        GroupDetailHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  private validateUpdateDate(
    targetHistory: GroupDetailHistoryModel,
    historyDate: HistoryUpdateDate,
  ) {
    if (!targetHistory.endDate && historyDate.endDate) {
      throw new BadRequestException(
        GroupDetailHistoryException.CANNOT_UPDATE_END_DATE,
      );
    }

    // 시작 날짜만 변경
    if (historyDate.startDate && !historyDate.endDate) {
      if (
        targetHistory.endDate &&
        historyDate.startDate > targetHistory.endDate
      ) {
        throw new BadRequestException(
          GroupDetailHistoryException.INVALID_UPDATE_START_DATE,
        );
      }
    } else if (!historyDate.startDate && historyDate.endDate) {
      if (historyDate.endDate < targetHistory.startDate) {
        throw new BadRequestException(
          GroupDetailHistoryException.INVALID_UPDATE_END_DATE,
        );
      }
    }
  }

  async deleteDetailHistory(
    targetHistory: GroupDetailHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    if (targetHistory.endDate === null) {
      throw new BadRequestException(GroupDetailHistoryException.CANNOT_DELETE);
    }

    const repository = this.getRepository(qr);

    const result = await repository.softDelete(targetHistory.id);

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        GroupDetailHistoryException.DELETE_ERROR,
      );
    }

    return result;
  }
}
