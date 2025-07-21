import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IMinistryGroupHistoryDomainService } from '../interface/ministry-group-history-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryGroupHistoryModel } from '../../entity/ministry-group-history.entity';
import { In, IsNull, QueryRunner, Repository } from 'typeorm';
import { MinistryGroupModel } from '../../../../management/ministries/entity/ministry-group.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { MinistryGroupHistoryException } from '../../exception/ministry-group-history.exception';

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
        endDate: 'DESC',
        startDate: 'DESC',
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

  startMinistryGroupHistories(
    ministryGroup: MinistryGroupModel,
    members: MemberModel[],
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
        startDate: new Date(),
      }),
    );

    return repository.save(histories);
  }

  async endMinistryGroupHistories(
    ministryGroup: MinistryGroupModel,
    ministryGroupSnapShot: string,
    members: MemberModel[],
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
        endDate: new Date(),
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

  updateMinistryGroupHistory() {}

  deleteMinistryGroupHistory() {}
}
