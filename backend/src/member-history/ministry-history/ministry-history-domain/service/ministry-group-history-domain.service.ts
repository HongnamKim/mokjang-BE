import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IMinistryGroupHistoryDomainService } from '../interface/ministry-group-history-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryGroupHistoryModel } from '../../entity/ministry-group-history.entity';
import {
  FindOptionsRelations,
  In,
  IsNull,
  QueryRunner,
  Repository,
} from 'typeorm';
import { MinistryGroupModel } from '../../../../management/ministries/entity/ministry-group.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { MinistryGroupHistoryException } from '../../exception/ministry-group-history.exception';
import { GetMinistryGroupHistoriesDto } from '../../dto/request/group/get-ministry-group-histories.dto';
import { TIME_ZONE } from '../../../../common/const/time-zone.const';
import { HistoryUpdateDate } from '../../../history-date.utils';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class MinistryGroupHistoryDomainService
  implements IMinistryGroupHistoryDomainService
{
  constructor(
    @InjectRepository(MinistryGroupHistoryModel)
    private readonly ministryGroupHistoryRepository: Repository<MinistryGroupHistoryModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryGroupHistoryModel)
      : this.ministryGroupHistoryRepository;
  }

  paginateMinistryGroupHistories(
    member: MemberModel,
    dto: GetMinistryGroupHistoriesDto,
    qr?: QueryRunner,
  ): Promise<MinistryGroupHistoryModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        member: {
          id: member.id,
        },
      },
      relations: {
        ministryGroup: true,
      },
      order: {
        endDate: dto.orderDirection,
        startDate: dto.orderDirection,
        id: dto.orderDirection,
      },
    });
  }

  async findCurrentMinistryGroupHistory(
    member: MemberModel,
    ministryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ): Promise<MinistryGroupHistoryModel> {
    const repository = this.getRepository(qr);

    const history = await repository.findOne({
      where: {
        memberId: member.id,
        ministryGroupId: ministryGroup.id,
        endDate: IsNull(),
      },
    });

    if (!history) {
      throw new NotFoundException('사역그룹 이력을 찾을 수 없습니다.');
    }

    return history;
  }

  async findMinistryGroupHistoryModelById(
    member: MemberModel,
    ministryGroupHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryGroupHistoryModel>,
  ) {
    const repository = this.getRepository(qr);

    const ministryGroupHistory = await repository.findOne({
      where: {
        memberId: member.id,
        id: ministryGroupHistoryId,
      },
      relations: relationOptions,
    });

    if (!ministryGroupHistory) {
      throw new NotFoundException(MinistryGroupHistoryException.NOT_FOUND);
    }

    return ministryGroupHistory;
  }

  startMinistryGroupHistories(
    ministryGroup: MinistryGroupModel,
    members: MemberModel[],
    startDate: Date,
    qr: QueryRunner,
  ): Promise<MinistryGroupHistoryModel[]> {
    const repository = this.getRepository(qr);

    const histories = members.map((member) =>
      repository.create({
        member: {
          id: member.id,
        },
        ministryGroup: {
          id: ministryGroup.id,
        },
        startDate,
      }),
    );

    return repository.save(histories);
  }

  async validateEndDates(
    members: MemberModel[],
    ministryGroup: MinistryGroupModel,
    endDate: Date,
    qr: QueryRunner,
  ) {
    const memberIds = members.map((m) => m.id);

    const invalidMembers = await qr.manager
      .createQueryBuilder(MinistryGroupHistoryModel, 'mgh')
      .select(['mgh.memberId', 'mgh.startDate', 'm.name'])
      .innerJoin('mgh.member', 'm')
      .where('mgh.memberId IN (:...memberIds)', { memberIds })
      .andWhere('mgh.ministryGroupId = :ministryGroupId', {
        ministryGroupId: ministryGroup.id,
      })
      .andWhere('mgh.endDate IS NULL')
      .andWhere('mgh.startDate > :endDate', { endDate })
      .andWhere('mgh.deletedAt IS NULL')
      .getMany();

    if (invalidMembers.length > 0) {
      const invalidInfo = invalidMembers
        .map(
          (h) =>
            `${h.member.name}(${format(toZonedTime(h.startDate, TIME_ZONE.SEOUL), 'yyyy-MM-dd')})`,
        )
        .join(', ');

      throw new BadRequestException(
        `다음 교인들의 기존 사역 그룹 시작일이 종료일(${format(toZonedTime(endDate, TIME_ZONE.SEOUL), 'yyyy-MM-dd')})보다 늦습니다: ${invalidInfo}`,
      );
    }
  }

  async endMinistryGroupHistories(
    ministryGroup: MinistryGroupModel,
    ministryGroupSnapShot: string,
    members: MemberModel[],
    endDate: Date,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        ministryGroupId: ministryGroup.id,
        memberId: In(members.map((member) => member.id)),
      },
      {
        ministryGroupId: null,
        endDate,
        ministryGroupSnapShot,
      },
    );

    if (result.affected !== members.length) {
      throw new InternalServerErrorException(
        MinistryGroupHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async updateMinistryGroupHistory(
    targetHistory: MinistryGroupHistoryModel,
    historyDate: HistoryUpdateDate,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);
    /**
     * 제약
     * 1. startDate 와 endDate 는 오늘을 넘어설 수 없다.
     * 2. startDate 는 endDate 를 넘어설 수 없다.
     * 3. 종료된 이력만 endDate 를 수정할 수 있다.
     */
    this.assertValidateUpdateDate(targetHistory, historyDate);

    const result = await repository.update(
      { id: targetHistory.id },
      {
        startDate: historyDate.startDate,
        endDate: historyDate.endDate,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryGroupHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteMinistryGroupHistory(
    targetHistory: MinistryGroupHistoryModel,
    qr?: QueryRunner,
  ) {
    if (!targetHistory.endDate) {
      throw new BadRequestException(
        MinistryGroupHistoryException.CANNOT_DELETE,
      );
    }

    const repository = this.getRepository(qr);

    const result = await repository.softDelete({ id: targetHistory.id });

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryGroupHistoryException.DELETE_ERROR,
      );
    }

    return result;
  }

  private assertValidateUpdateDate(
    targetHistory: MinistryGroupHistoryModel,
    historyDate: HistoryUpdateDate,
  ) {
    if (!targetHistory.endDate && historyDate.endDate) {
      throw new BadRequestException(
        MinistryGroupHistoryException.CANNOT_UPDATE_END_DATE,
      );
    }

    // 시작 날짜만 변경
    if (historyDate.startDate && !historyDate.endDate) {
      if (
        targetHistory.endDate &&
        historyDate.startDate > targetHistory.endDate
      ) {
        throw new BadRequestException(
          MinistryGroupHistoryException.INVALID_START_DATE,
        );
      }
    } else if (!historyDate.startDate && historyDate.endDate) {
      if (historyDate.endDate < targetHistory.startDate) {
        throw new BadRequestException(
          MinistryGroupHistoryException.INVALID_END_DATE,
        );
      }
    }
  }
}
