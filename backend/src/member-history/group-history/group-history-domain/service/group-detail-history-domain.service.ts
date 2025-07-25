import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IGroupDetailHistoryDomainService } from '../interface/group-detail-history-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupDetailHistoryModel } from '../../entity/group-detail-history.entity';
import { In, IsNull, QueryRunner, Repository } from 'typeorm';
import { MemberModel } from '../../../../members/entity/member.entity';
import { GroupHistoryModel } from '../../entity/group-history.entity';
import { GroupHistoryException } from '../../exception/group-history.exception';
import { GroupRole } from '../../../../management/groups/const/group-role.enum';

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
        GroupHistoryException.NOT_FOUND_CURRENT_DETAIL,
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
    const repository = this.getRepository(qr);

    return repository.save({
      member: { id: member.id },
      groupHistory: { id: groupHistory.id },
      role: groupRole,
      startDate: startDate,
    });
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
}
