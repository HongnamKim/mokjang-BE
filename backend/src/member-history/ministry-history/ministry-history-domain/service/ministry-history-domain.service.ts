import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IMinistryHistoryDomainService } from '../interface/ministry-history-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryHistoryModel } from '../../entity/ministry-history.entity';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import { MemberModel } from '../../../../members/entity/member.entity';
import { GetMinistryHistoriesDto } from '../../dto/request/ministry/get-ministry-histories.dto';
import { MinistryHistoryException } from '../../exception/ministry-history.exception';
import { StartMinistryHistoryVo } from '../../dto/start-ministry-history.vo';
import { EndMinistryHistoryVo } from '../../dto/end-ministry-history.vo';
import { MinistryGroupHistoryModel } from '../../entity/ministry-group-history.entity';
import {
  getHistoryEndDate,
  getHistoryStartDate,
  HistoryUpdateDate,
} from '../../../history-date.utils';
import { MinistryGroupHistoryException } from '../../exception/ministry-group-history.exception';
import { TIME_ZONE } from '../../../../common/const/time-zone.const';

@Injectable()
export class MinistryHistoryDomainService
  implements IMinistryHistoryDomainService
{
  constructor(
    @InjectRepository(MinistryHistoryModel)
    private ministryHistoryRepository: Repository<MinistryHistoryModel>,
  ) {}

  private getMinistryHistoryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryHistoryModel)
      : this.ministryHistoryRepository;
  }

  async paginateMinistryHistory(
    member: MemberModel,
    ministryGroupHistory: MinistryGroupHistoryModel,
    dto: GetMinistryHistoriesDto,
    qr?: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    return ministryHistoryRepository.find({
      where: {
        memberId: member.id,
        ministryGroupHistoryId: ministryGroupHistory.id,
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
    });
  }

  async findMinistryHistoryModelById(
    member: MemberModel,
    ministryGroupHistory: MinistryGroupHistoryModel,
    ministryHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryHistoryModel>,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const ministryHistory = await ministryHistoryRepository.findOne({
      where: {
        id: ministryHistoryId,
        ministryGroupHistoryId: ministryGroupHistory.id,
        memberId: member.id,
      },
      relations: { ministry: true, ...relationOptions },
    });

    if (!ministryHistory) {
      throw new NotFoundException(MinistryHistoryException.NOT_FOUND);
    }

    return ministryHistory;
  }

  async startMinistryHistories(
    ministryHistoryVo: StartMinistryHistoryVo[],
    qr: QueryRunner,
  ): Promise<MinistryHistoryModel[]> {
    const repository = this.getMinistryHistoryRepository(qr);

    const histories = repository.create(
      ministryHistoryVo.map((vo) => ({
        member: {
          id: vo.member.id,
        },
        ministry: {
          id: vo.ministry.id,
        },
        ministryGroupHistory: {
          id: vo.ministryGroupHistory.id,
        },
        startDate: getHistoryStartDate(TIME_ZONE.SEOUL),
      })),
    );

    return repository.save(histories);
  }

  async endMinistryHistories(
    endMinistryHistoryVo: EndMinistryHistoryVo[],
    qr: QueryRunner,
  ): Promise<MinistryHistoryModel[]> {
    const repository = this.getMinistryHistoryRepository(qr);

    const histories = await repository.find({
      where: endMinistryHistoryVo.map((vo) => ({
        member: { id: vo.member.id },
        ministry: { id: vo.ministry.id },
        endDate: IsNull(),
      })),
    });

    histories.forEach((history) => {
      // 종료 시점 사역명 저장
      const assignment = endMinistryHistoryVo.find(
        (a) =>
          a.member.id === history.memberId &&
          a.ministry.id === history.ministryId,
      );
      if (assignment) {
        history.ministrySnapShot = assignment.ministry.name;
      }

      // 종료 시점
      history.endDate = getHistoryEndDate(TIME_ZONE.SEOUL);

      // 이력 - 사역 관계 해제
      history.ministryId = null;
      history.ministry = null;
    });

    return repository.save(histories);
  }

  async updateMinistryHistory(
    targetHistory: MinistryHistoryModel,
    historyDate: HistoryUpdateDate,
    qr?: QueryRunner,
  ) {
    const repository = this.getMinistryHistoryRepository(qr);

    this.isValidUpdateDate(targetHistory, historyDate);

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

  async deleteMinistryHistory(
    ministryHistory: MinistryHistoryModel,
    qr?: QueryRunner,
  ) {
    if (ministryHistory.endDate === null) {
      throw new BadRequestException(MinistryHistoryException.CANNOT_DELETE);
    }

    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const result = await ministryHistoryRepository.softDelete(
      ministryHistory.id,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryHistoryException.DELETE_ERROR,
      );
    }

    return result;
  }

  private isValidUpdateDate(
    targetHistory: MinistryHistoryModel,
    historyDate: HistoryUpdateDate,
  ) {
    if (!targetHistory.endDate && historyDate.endDate) {
      throw new BadRequestException(
        MinistryHistoryException.CANNOT_UPDATE_END_DATE,
      );
    }

    // 시작 날짜만 변경
    if (historyDate.startDate && !historyDate.endDate) {
      if (
        targetHistory.endDate &&
        historyDate.startDate > targetHistory.endDate
      ) {
        throw new BadRequestException(
          MinistryHistoryException.INVALID_START_DATE,
        );
      }
    } else if (!historyDate.startDate && historyDate.endDate) {
      if (historyDate.endDate < targetHistory.startDate) {
        throw new BadRequestException(
          MinistryHistoryException.INVALID_END_DATE,
        );
      }
    }
  }
}
