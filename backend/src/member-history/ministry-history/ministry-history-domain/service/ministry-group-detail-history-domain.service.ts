import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IMinistryGroupDetailHistoryDomainService } from '../interface/ministry-group-detail-history-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryGroupDetailHistoryModel } from '../../entity/ministry-group-detail-history.entity';
import {
  FindOptionsRelations,
  IsNull,
  MoreThan,
  QueryRunner,
  Repository,
} from 'typeorm';
import { MinistryGroupHistoryModel } from '../../entity/ministry-group-history.entity';
import { GroupRole } from '../../../../management/groups/const/group-role.enum';
import { MemberModel } from '../../../../members/entity/member.entity';
import { MinistryGroupRoleHistoryModel } from '../../entity/child/ministry-group-role-history.entity';
import { MinistryGroupRoleHistoryException } from '../../exception/ministry-group-role-history.exception';
import { StartMinistryHistoryVo } from '../../dto/start-ministry-history.vo';
import { MinistryHistoryModel } from '../../entity/child/ministry-history.entity';
import { EndMinistryHistoryVo } from '../../dto/end-ministry-history.vo';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../../../common/const/time-zone.const';

@Injectable()
export class MinistryGroupDetailHistoryDomainService
  implements IMinistryGroupDetailHistoryDomainService
{
  constructor(
    @InjectRepository(MinistryGroupDetailHistoryModel)
    private readonly repository: Repository<MinistryGroupDetailHistoryModel>,
    @InjectRepository(MinistryGroupRoleHistoryModel)
    private readonly roleRepository: Repository<MinistryGroupRoleHistoryModel>,
    @InjectRepository(MinistryHistoryModel)
    private readonly ministryHistoryRepository: Repository<MinistryHistoryModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryGroupDetailHistoryModel)
      : this.repository;
  }

  private getRoleRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryGroupRoleHistoryModel)
      : this.roleRepository;
  }

  private getMinistryHistoryRepository(qr: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryHistoryModel)
      : this.ministryHistoryRepository;
  }

  async paginateDetailHistories(
    ministryGroupHistory: MinistryGroupHistoryModel,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const histories = await repository.find({
      where: {
        ministryGroupHistoryId: ministryGroupHistory.id,
      },
    });

    return histories;
  }

  async findMinistryDetailHistoryModelById(
    member: MemberModel,
    ministryGroupHistory: MinistryGroupHistoryModel,
    detailId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryGroupDetailHistoryModel>,
  ) {
    const repository = this.getRepository(qr);

    const history = await repository.findOne({
      where: {
        id: detailId,
        ministryGroupHistoryId: ministryGroupHistory.id,
        memberId: member.id,
      },
      relations: { ...relationOptions },
    });

    if (!history) {
      throw new NotFoundException();
    }

    return history;
  }

  async startMinistryHistories(
    ministryHistoryVo: StartMinistryHistoryVo[],
    startDate: Date,
    qr: QueryRunner,
  ) {
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
        startDate,
      })),
    );

    return repository.save(histories);
  }

  async validateMinistryEndDates(
    endMinistryHistoryVo: EndMinistryHistoryVo[],
    endDate: Date,
    qr: QueryRunner,
  ) {
    const repository = this.getMinistryHistoryRepository(qr);

    const invalidHistories = await repository.find({
      where: endMinistryHistoryVo.map((vo) => ({
        memberId: vo.member.id,
        ministryId: vo.ministry.id,
        startDate: MoreThan(endDate),
      })),
      relations: {
        member: true,
      },
    });

    if (invalidHistories.length > 0) {
      const invalidInfo = invalidHistories
        .map(
          (h) =>
            `${h.member.name}(${format(toZonedTime(h.startDate, TIME_ZONE.SEOUL), 'yyyy-MM-dd')})`,
        )
        .join(', ');

      throw new BadRequestException(
        `다음 교인들의 기존 사역 시작일이 종료일(${format(toZonedTime(endDate, TIME_ZONE.SEOUL), 'yyyy-MM-dd')})보다 늦습니다: ${invalidInfo}`,
      );
    }
  }

  async endMinistryHistories(
    endMinistryHistoryVo: EndMinistryHistoryVo[],
    endDate: Date,
    qr: QueryRunner,
  ) {
    const repository = this.getMinistryHistoryRepository(qr);

    const histories = await repository.find({
      where: endMinistryHistoryVo.map((vo) => ({
        memberId: vo.member.id,
        ministryId: vo.ministry.id,
        endDate: IsNull(),
      })),
    });

    histories.forEach((history) => {
      const assignment = endMinistryHistoryVo.find(
        (a) =>
          a.member.id === history.memberId &&
          a.ministry.id === history.ministryId,
      );

      if (assignment) {
        history.ministrySnapShot = assignment.ministry.name;
      }

      history.endDate = endDate;

      history.ministryId = null;
      history.ministry = null;
    });

    return repository.save(histories);
  }

  async findCurrentRoleHistory(
    ministryGroupHistory: MinistryGroupHistoryModel,
    qr?: QueryRunner,
  ) {
    const roleRepository = this.getRoleRepository(qr);

    const history = await roleRepository.findOne({
      where: {
        ministryGroupHistoryId: ministryGroupHistory.id,
        endDate: IsNull(),
      },
    });

    if (!history) {
      throw new NotFoundException(
        MinistryGroupRoleHistoryException.NOT_FOUND_CURRENT,
      );
    }

    return history;
  }

  startMinistryGroupRoleHistory(
    member: MemberModel,
    ministryGroupHistory: MinistryGroupHistoryModel,
    startDate: Date,
    qr: QueryRunner,
  ) {
    if (ministryGroupHistory.startDate > startDate) {
      throw new BadRequestException(
        MinistryGroupRoleHistoryException.INVALID_NEW_START_DATE,
      );
    }

    const repository = this.getRoleRepository(qr);

    return repository.save({
      memberId: member.id,
      ministryGroupHistoryId: ministryGroupHistory.id,
      startDate,
      role: GroupRole.LEADER,
    });
  }

  async endMinistryGroupRoleHistory(
    currentRoleHistory: MinistryGroupRoleHistoryModel,
    endDate: Date,
    qr: QueryRunner,
  ) {
    if (currentRoleHistory.startDate > endDate) {
      throw new BadRequestException(
        MinistryGroupRoleHistoryException.INVALID_END_DATE,
      );
    }

    const repository = this.getRoleRepository(qr);

    const result = await repository.update(
      {
        id: currentRoleHistory.id,
      },
      {
        endDate,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryGroupRoleHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }
}
