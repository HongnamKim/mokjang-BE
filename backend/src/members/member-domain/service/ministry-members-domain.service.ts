import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberModel } from '../../entity/member.entity';
import {
  FindOptionsRelations,
  In,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { MinistryGroupModel } from '../../../management/ministries/entity/ministry-group.entity';
import { MemberException } from '../../const/exception/member.exception';
import { IMinistryMembersDomainService } from '../interface/ministry-members-domain.service.interface';
import { GetMinistryGroupMembersDto } from '../../../management/ministries/dto/ministry-group/request/member/get-ministry-group-members.dto';
import { MinistryGroupMemberOrder } from '../../../management/ministries/const/ministry-group-member-order.enum';
import { GroupRole } from '../../../management/groups/const/group-role.enum';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetUnassignedMembersDto } from '../../../management/ministries/dto/ministry-group/request/get-unassigned-members.dto';
import { SearchMembersForMinistryGroupDto } from '../../../management/ministries/dto/ministry-group/request/member/search-members-for-ministry-group.dto';

@Injectable()
export class MinistryMembersDomainService
  implements IMinistryMembersDomainService
{
  constructor(
    @InjectRepository(MemberModel)
    private readonly membersRepository: Repository<MemberModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(MemberModel) : this.membersRepository;
  }

  searchMembersForMinistryGroup(
    church: ChurchModel,
    ministryGroup: MinistryGroupModel,
    dto: SearchMembersForMinistryGroupDto,
  ) {
    const repository = this.getRepository();

    return repository
      .createQueryBuilder('member')
      .select([
        'member.id',
        'member.name',
        'member.profileImageUrl',
        'member.mobilePhone',
        'member.registeredAt',
        'member.birth',
        'member.isLunar',
        'member.isLeafMonth',
        'member.groupRole',
        'member.ministryGroupRole',
      ])
      .leftJoin('member.officer', 'officer')
      .addSelect(['officer.id', 'officer.name'])
      .leftJoin('member.group', 'group')
      .addSelect(['group.id', 'group.name'])
      .leftJoin(
        'member.ministryGroups',
        'ministryGroup',
        'ministryGroup.id = :ministryGroupId',
        { ministryGroupId: ministryGroup.id },
      )
      .addSelect(['ministryGroup.id', 'ministryGroup.name'])
      .where('member.churchId = :churchId', { churchId: church.id })
      .andWhere('member.name ILIKE :name', { name: `%${dto.name ?? ''}%` })
      .orderBy(
        `member."${dto.order}"`,
        dto.orderDirection === 'ASC' || dto.orderDirection === 'asc'
          ? 'ASC'
          : 'DESC',
      )
      .addOrderBy(
        'member.id',
        dto.orderDirection === 'ASC' || dto.orderDirection === 'asc'
          ? 'ASC'
          : 'DESC',
      )
      .limit(dto.take)
      .offset(dto.take * (dto.page - 1))
      .getMany();
  }

  findUnassignedMembers(
    church: ChurchModel,
    dto: GetUnassignedMembersDto,
  ): Promise<MemberModel[]> {
    const repository = this.getRepository();

    return repository
      .createQueryBuilder('member')
      .select([
        'member.id',
        'member.name',
        'member.profileImageUrl',
        'member.mobilePhone',
        'member.registeredAt',
        'member.birth',
        'member.isLunar',
        'member.isLeafMonth',
        'member.groupRole',
        'member.ministryGroupRole',
      ])
      .leftJoin('member.officer', 'officer')
      .addSelect(['officer.id', 'officer.name'])
      .leftJoin('member.group', 'group')
      .addSelect(['group.id', 'group.name'])
      .where('member.churchId = :churchId', { churchId: church.id })
      .andWhere('member."ministryGroupRole" = :ministryGroupRole', {
        ministryGroupRole: GroupRole.NONE,
      })
      .orderBy(
        `member."${dto.order}"`,
        dto.orderDirection === 'ASC' || dto.orderDirection === 'asc'
          ? 'ASC'
          : 'DESC',
      )
      .addOrderBy(
        'member.id',
        dto.orderDirection === 'ASC' || dto.orderDirection === 'asc'
          ? 'ASC'
          : 'DESC',
      )
      .limit(dto.take)
      .offset(dto.take * (dto.page - 1))
      .getMany();
  }

  async findMinistryGroupMembersByIds(
    ministryGroup: MinistryGroupModel,
    memberIds: number[],
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const ministryGroupMembers = await repository
      .createQueryBuilder('member')
      .select(['member.id', 'member.name'])
      .innerJoin('member.ministryGroups', 'ministryGroup')
      .leftJoin(
        'member.ministries',
        'ministry',
        'ministry.ministryGroupId = :ministryGroupId',
        { ministryGroupId: ministryGroup.id },
      )
      .addSelect(['ministry.id', 'ministry.name'])
      .where('ministryGroup.id = :ministryGroupId', {
        ministryGroupId: ministryGroup.id,
      })
      .andWhere('member.id IN (:...memberIds)', { memberIds })
      .getMany();

    if (ministryGroupMembers.length !== memberIds.length) {
      throw new NotFoundException(MemberException.NOT_EXIST_IN_MINISTRY_GROUP);
    }

    return ministryGroupMembers;
  }

  async findMinistryGroupMembers(
    ministryGroup: MinistryGroupModel,
    dto: GetMinistryGroupMembersDto,
  ): Promise<MemberModel[]> {
    const repository = this.getRepository();

    const qb = repository
      .createQueryBuilder('member')
      .select([
        'member.id',
        'member.name',
        'member.profileImageUrl',
        'member.mobilePhone',
        'member.registeredAt',
        'member.birth',
        'member.isLunar',
        'member.isLeafMonth',
        'member.groupRole',
        'member.ministryGroupRole',
      ])
      .innerJoin('member.ministryGroups', 'ministryGroup')
      .leftJoin('member.officer', 'officer')
      .addSelect(['officer.id', 'officer.name'])
      .leftJoin('member.group', 'group')
      .addSelect(['group.id', 'group.name'])
      .leftJoin(
        'member.ministries',
        'ministry',
        'ministry.ministryGroupId = :ministryGroupId',
        { ministryGroupId: ministryGroup.id },
      )
      .addSelect(['ministry.id', 'ministry.name'])
      .where('ministryGroup.id = :ministryGroupId', {
        ministryGroupId: ministryGroup.id,
      })
      .orderBy('member.ministryGroupRole', 'ASC')
      .addOrderBy(
        dto.order === MinistryGroupMemberOrder.MINISTRY_NAME
          ? 'ministry.name'
          : `member."${dto.order}"`,
        dto.orderDirection === 'ASC' || dto.orderDirection === 'asc'
          ? 'ASC'
          : 'DESC',
      )
      .addOrderBy(
        'member.id',
        dto.orderDirection === 'ASC' || dto.orderDirection === 'asc'
          ? 'ASC'
          : 'DESC',
      )
      .limit(dto.take)
      .offset(dto.take * (dto.page - 1));

    return qb.getMany();
  }

  async updateMinistryGroupRole(
    members: MemberModel[],
    ministryGroupRole: GroupRole,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);
    const memberIds = members.map((member) => member.id);

    const result = await repository.update(
      {
        id: In(memberIds),
      },
      {
        ministryGroupRole: ministryGroupRole,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(MemberException.UPDATE_ERROR);
    }

    return result;
  }

  async findMinistryGroupMemberModelById(
    ministryGroup: MinistryGroupModel,
    memberId: number,
    qr?: QueryRunner,
    relations?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel> {
    const repository = this.getRepository(qr);

    const member = await repository
      .createQueryBuilder('member')
      .select([
        'member.id',
        'member.name',
        'member.profileImageUrl',
        'member.mobilePhone',
        'member.registeredAt',
        'member.birth',
        'member.isLunar',
        'member.isLeafMonth',
        'member.groupRole',
        'member.ministryGroupRole',
      ])
      .leftJoin('member.officer', 'officer')
      .addSelect(['officer.id', 'officer.name'])
      .leftJoin('member.group', 'group')
      .addSelect(['group.id', 'group.name'])
      .innerJoin(
        'member.ministryGroups',
        'ministryGroup',
        'ministryGroup.id = :ministryGroupId',
        { ministryGroupId: ministryGroup.id },
      )
      .leftJoin(
        'member.ministries',
        'ministry',
        'ministry.ministryGroupId = :ministryGroupId',
        { ministryGroupId: ministryGroup.id },
      )
      .addSelect(['ministry.id', 'ministry.name'])
      .where('member.id = :memberId', { memberId })
      .getOne();

    if (!member) {
      throw new NotFoundException(MemberException.NOT_EXIST_IN_MINISTRY_GROUP);
    }

    return member;
  }
}
