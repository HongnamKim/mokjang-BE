import { InjectRepository } from '@nestjs/typeorm';
import { OfficerHistoryModel } from '../../entity/officer-history.entity';
import {
  FindOptionsRelations,
  In,
  IsNull,
  MoreThan,
  QueryRunner,
  Repository,
} from 'typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { GetOfficerHistoryDto } from '../../dto/request/get-officer-history.dto';
import { IOfficerHistoryDomainService } from '../interface/officer-history-domain.service.interface';
import { OfficerModel } from '../../../../management/officers/entity/officer.entity';
import { OfficerHistoryException } from '../../exception/officer-history.exception';
import {
  getHistoryEndDate,
  HistoryUpdateDate,
} from '../../../history-date.utils';
import { TIME_ZONE } from '../../../../common/const/time-zone.const';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class OfficerHistoryDomainService
  implements IOfficerHistoryDomainService
{
  constructor(
    @InjectRepository(OfficerHistoryModel)
    private readonly officerHistoryRepository: Repository<OfficerHistoryModel>,
  ) {}

  private getOfficerHistoryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(OfficerHistoryModel)
      : this.officerHistoryRepository;
  }

  async paginateOfficerHistory(
    church: ChurchModel,
    member: MemberModel,
    dto: GetOfficerHistoryDto,
    qr?: QueryRunner,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    return officerHistoryRepository.find({
      where: {
        member: {
          churchId: church.id,
        },
        memberId: member.id,
      },
      relations: { officer: true },
      order: {
        startDate: dto.orderDirection,
        id: dto.orderDirection,
      },
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
  }

  startOfficerHistory(
    members: MemberModel[],
    officer: OfficerModel,
    startDate: Date,
    qr: QueryRunner,
  ): Promise<OfficerHistoryModel[]> {
    const repository = this.getOfficerHistoryRepository(qr);

    const histories = repository.create(
      members.map((member) => ({
        member: { id: member.id },
        officer: { id: officer.id },
        startDate: startDate, //getHistoryStartDate(TIME_ZONE.SEOUL),
      })),
    );

    return repository.save(histories);
  }

  async validateOfficerEndDates(
    members: MemberModel[],
    endDate: Date,
    qr: QueryRunner,
  ): Promise<void> {
    const repository = this.getOfficerHistoryRepository(qr);

    const memberIds = members.map((m) => m.id);

    const invalidHistories = await repository.find({
      where: {
        memberId: In(memberIds),
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
        `다음 교인들의 기존 직분 시작일이 새 직분의 시작일(${format(toZonedTime(endDate, TIME_ZONE.SEOUL), 'yyyy-MM-dd')})보다 늦습니다: ${invalidInfos}`,
      );
    }

    return Promise.resolve(undefined);
  }

  async endOfficerHistories(
    members: MemberModel[],
    endDate: Date,
    qr: QueryRunner,
    officer?: OfficerModel,
  ) {
    const repository = this.getOfficerHistoryRepository(qr);

    const memberIds = members.map((m) => m.id);

    if (!officer) {
      const oldHistories = await repository.find({
        where: {
          memberId: In(memberIds),
          endDate: IsNull(),
        },
        relations: {
          officer: true,
        },
      });

      oldHistories.forEach((oldHistory) => {
        oldHistory.officerSnapShot = oldHistory.officer?.name as string;
        oldHistory.endDate = getHistoryEndDate(TIME_ZONE.SEOUL);
        oldHistory.officerId = null;
        oldHistory.officer = null;
        oldHistory.endDate = endDate;
      });

      return repository.save(oldHistories);
    }

    const result = await repository.update(
      {
        memberId: In(memberIds),
        officerId: officer.id,
        endDate: IsNull(),
      },
      {
        officerSnapShot: officer.name,
        endDate,
        //endDate: getHistoryEndDate(TIME_ZONE.SEOUL),
        officerId: null,
        officer: null,
      },
    );

    if (result.affected !== members.length) {
      throw new InternalServerErrorException(
        OfficerHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async findCurrentOfficerHistoryModel(
    member: MemberModel,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<OfficerHistoryModel>,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const history = await officerHistoryRepository.findOne({
      where: {
        memberId: member.id,
        endDate: IsNull(),
      },
      relations: { ...relationOptions },
    });

    if (!history) {
      throw new NotFoundException(OfficerHistoryException.NOT_FOUND);
    }

    if (!history.officerId) {
      throw new InternalServerErrorException(
        OfficerHistoryException.RELATION_OPTIONS_ERROR,
        //'현재 직분 이력의 직분 정보를 가져올 수 없음',
      );
    }

    return history;
  }

  async findOfficerHistoryModelById(
    member: MemberModel,
    officerHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<OfficerHistoryModel>,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const history = await officerHistoryRepository.findOne({
      where: {
        id: officerHistoryId,
        memberId: member.id,
      },
      relations: relationOptions,
    });

    if (!history) {
      throw new NotFoundException(OfficerHistoryException.NOT_FOUND);
    }

    return history;
  }

  private isValidUpdateDate(
    targetHistory: OfficerHistoryModel,
    historyDate: HistoryUpdateDate,
  ) {
    if (!targetHistory.endDate && historyDate.endDate) {
      throw new BadRequestException(
        OfficerHistoryException.CANNOT_UPDATE_END_DATE,
      );
    }

    // 시작 날짜만 변경
    if (historyDate.startDate && !historyDate.endDate) {
      if (
        targetHistory.endDate &&
        historyDate.startDate > targetHistory.endDate
      ) {
        throw new BadRequestException(
          OfficerHistoryException.INVALID_START_DATE,
        );
      }
    } else if (!historyDate.startDate && historyDate.endDate) {
      if (historyDate.endDate < targetHistory.startDate) {
        throw new BadRequestException(OfficerHistoryException.INVALID_END_DATE);
      }
    }
  }

  async updateOfficerHistory(
    officerHistory: OfficerHistoryModel,
    historyDate: HistoryUpdateDate,
    qr: QueryRunner,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    this.isValidUpdateDate(officerHistory, historyDate);

    const result = await officerHistoryRepository.update(
      {
        id: officerHistory.id,
      },
      {
        startDate: historyDate.startDate,
        endDate: historyDate.endDate,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        OfficerHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteOfficerHistory(
    officerHistory: OfficerHistoryModel,
    qr?: QueryRunner,
  ) {
    if (officerHistory.endDate === null) {
      throw new BadRequestException(OfficerHistoryException.CANNOT_DELETE);
    }

    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const result = await officerHistoryRepository.softDelete(officerHistory.id);

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        OfficerHistoryException.DELETE_ERROR,
      );
    }

    return result;
  }
}
