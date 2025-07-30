import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IGroupMembersDomainService } from '../interface/group-members.domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberModel } from '../../entity/member.entity';
import {
  FindOptionsRelations,
  In,
  IsNull,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GroupModel } from '../../../management/groups/entity/group.entity';
import { GetGroupMembersDto } from '../../../management/groups/dto/request/members/get-group-members.dto';
import { GroupMemberOrder } from '../../../management/groups/const/group-member-order.enum';
import {
  MemberSummarizedGroupSelectQB,
  MemberSummarizedOfficerSelectQB,
  MemberSummarizedRelation,
  MemberSummarizedSelect,
  MemberSummarizedSelectQB,
} from '../../const/member-find-options.const';
import { MemberException } from '../../exception/member.exception';
import { GroupRole } from '../../../management/groups/const/group-role.enum';
import { GetUnassignedMembersDto } from '../../../management/ministries/dto/ministry-group/request/member/get-unassigned-members.dto';
import { GroupMemberDto } from '../../dto/group-member.dto';

@Injectable()
export class GroupMembersDomainService implements IGroupMembersDomainService {
  constructor(
    @InjectRepository(MemberModel)
    private readonly repository: Repository<MemberModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(MemberModel) : this.repository;
  }

  findUnassignedMembers(
    church: ChurchModel,
    dto: GetUnassignedMembersDto,
    qr?: QueryRunner,
  ): Promise<MemberModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        churchId: church.id,
        groupId: IsNull(),
      },
      relations: MemberSummarizedRelation,
      select: MemberSummarizedSelect,
      order: {
        [dto.order]: dto.orderDirection,
        id: dto.orderDirection,
      },
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
  }

  async findGroupMembers(
    church: ChurchModel,
    group: GroupModel,
    dto: GetGroupMembersDto,
    qr?: QueryRunner,
  ): Promise<GroupMemberDto[]> {
    const repository = this.getRepository(qr);

    const members = await repository
      .createQueryBuilder('member')
      .where('member.churchId = :churchId', { churchId: church.id })
      .andWhere('member.groupId = :groupId', { groupId: group.id })
      .innerJoin('member.group', 'group')
      .leftJoin('member.officer', 'officer')
      .select(MemberSummarizedSelectQB)
      .addSelect(MemberSummarizedGroupSelectQB)
      .addSelect(MemberSummarizedOfficerSelectQB)
      .leftJoin(
        'member.groupHistory',
        'groupHistory',
        'groupHistory.endDate IS NULL',
      )
      .addSelect(['groupHistory.startDate'])
      .leftJoin(
        'groupHistory.groupDetailHistory',
        'groupDetailHistory',
        'groupDetailHistory.endDate IS NULL',
      )
      .addSelect(['groupDetailHistory.startDate'])
      .orderBy('member.groupRole', 'ASC')
      .addOrderBy(
        dto.order === GroupMemberOrder.OFFICER_NAME
          ? 'officer.name'
          : `member.${dto.order}`,
        dto.orderDirection,
      )
      .addOrderBy('member.id', dto.orderDirection)
      .limit(dto.take)
      .offset(dto.take * (dto.page - 1))
      .getMany();

    return members.map((member) => new GroupMemberDto(member));

    // 그룹장 최상위 고정
    /*const order: FindOptionsOrder<MemberModel> = {
      groupRole: 'ASC',
    };

    if (dto.order === GroupMemberOrder.OFFICER_NAME) {
      order.officer = {
        name: dto.orderDirection,
      };
      order.id = dto.orderDirection;
    } else {
      order[dto.order] = dto.orderDirection;
      order.id = dto.orderDirection;
    }

    return repository.find({
      take: dto.take,
      skip: dto.take * (dto.page - 1),
      where: {
        churchId: church.id,
        groupId: group.id,
      },
      order,
      relations: MemberSummarizedRelation,
      select: MemberSummarizedSelect,
    });*/
  }

  async findGroupMembersByIds(
    church: ChurchModel,
    group: GroupModel,
    memberIds: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel[]> {
    const repository = this.getRepository(qr);

    const members = await repository.find({
      where: {
        churchId: church.id,
        groupId: group.id,
        id: In(memberIds),
      },
      relations: relationOptions,
    });

    if (members.length !== memberIds.length) {
      throw new NotFoundException(MemberException.NOT_EXIST_IN_GROUP);
    }

    return members;
  }

  async assignGroup(
    members: MemberModel[],
    group: GroupModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const memberIds = members.map((member) => member.id);

    const result = await repository.update(
      { id: In(memberIds) },
      { groupId: group.id, groupRole: GroupRole.MEMBER },
    );

    if (result.affected !== members.length) {
      throw new InternalServerErrorException(MemberException.UPDATE_ERROR);
    }

    return result;
  }

  async removeGroup(members: MemberModel[], qr: QueryRunner) {
    const repository = this.getRepository(qr);

    const memberIds = members.map((member) => member.id);

    const result = await repository.update(
      {
        id: In(memberIds),
      },
      {
        groupId: null,
        groupRole: GroupRole.NONE,
      },
    );

    if (result.affected !== members.length) {
      throw new InternalServerErrorException(MemberException.UPDATE_ERROR);
    }

    return result;
  }

  countAllMembers(
    church: ChurchModel,
    group: GroupModel,
    qr?: QueryRunner,
  ): Promise<number> {
    const repository = this.getRepository(qr);

    return repository.count({
      where: {
        churchId: church.id,
        groupId: group.id,
      },
    });
  }
}
