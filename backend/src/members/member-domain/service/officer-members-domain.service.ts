import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IOfficerMembersDomainService } from '../interface/officer-members-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberModel } from '../../entity/member.entity';
import {
  FindOptionsRelations,
  In,
  IsNull,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetUnassignedMembersDto } from '../../../management/ministries/dto/ministry-group/request/member/get-unassigned-members.dto';
import {
  MemberSummarizedGroupSelectQB,
  MemberSummarizedOfficerSelectQB,
  MemberSummarizedRelation,
  MemberSummarizedSelect,
  MemberSummarizedSelectQB,
} from '../../const/member-find-options.const';
import { OfficerModel } from '../../../management/officers/entity/officer.entity';
import { GetOfficerMembersDto } from '../../../management/officers/dto/request/members/get-officer-members.dto';
import { MemberException } from '../../exception/member.exception';
import { OfficerMemberDto } from '../../dto/officer-member.dto';

@Injectable()
export class OfficerMembersDomainService
  implements IOfficerMembersDomainService
{
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
  ) {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        churchId: church.id,
        officerId: IsNull(),
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

  async findOfficerMembers(
    church: ChurchModel,
    officer: OfficerModel,
    dto: GetOfficerMembersDto,
    qr?: QueryRunner,
  ): Promise<OfficerMemberDto[]> {
    const repository = this.getRepository(qr);

    const members = await repository
      .createQueryBuilder('member')
      .innerJoin('member.officer', 'officer')
      .where('member.churchId = :churchId', { churchId: church.id })
      .andWhere('officer.id = :officerId', { officerId: officer.id })
      .leftJoin('member.group', 'group')
      .select(MemberSummarizedSelectQB)
      .addSelect(MemberSummarizedOfficerSelectQB)
      .addSelect(MemberSummarizedGroupSelectQB)
      .leftJoin(
        'member.officerHistory',
        'officerHistory',
        'officerHistory.endDate IS NULL',
      )
      .addSelect(['officerHistory.startDate'])
      .orderBy(`member.${dto.order}`, dto.orderDirection)
      .addOrderBy('member.id', dto.orderDirection)
      .limit(dto.take)
      .offset(dto.take * (dto.page - 1))
      .getMany();

    return members.map((member) => new OfficerMemberDto(member));

    /*return repository.find({
      where: {
        churchId: church.id,
        officerId: officer.id,
      },
      relations: MemberSummarizedRelation,
      select: MemberSummarizedSelect,
      order: {
        [dto.order]: dto.orderDirection,
        id: dto.orderDirection,
      },
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });*/
  }

  async findOfficerMembersByIds(
    church: ChurchModel,
    officer: OfficerModel,
    memberIds: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ) {
    const repository = this.getRepository(qr);

    const members = await repository.find({
      where: {
        churchId: church.id,
        officerId: officer.id,
        id: In(memberIds),
      },
      relations: relationOptions,
    });

    if (members.length !== memberIds.length) {
      throw new NotFoundException(MemberException.NOT_EXIST_IN_OFFICER);
    }

    return members;
  }

  async assignOfficer(
    members: MemberModel[],
    officer: OfficerModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const memberIds = members.map((m) => m.id);

    const result = await repository.update(
      {
        id: In(memberIds),
      },
      {
        officerId: officer.id,
      },
    );

    if (result.affected !== members.length) {
      throw new InternalServerErrorException(MemberException.UPDATE_ERROR);
    }

    return result;
  }

  async removeOfficer(members: MemberModel[], qr: QueryRunner) {
    const repository = this.getRepository(qr);

    const memberIds = members.map((m) => m.id);

    const result = await repository.update(
      {
        id: In(memberIds),
      },
      {
        officerId: null,
      },
    );

    if (result.affected !== members.length) {
      throw new InternalServerErrorException(MemberException.UPDATE_ERROR);
    }

    return result;
  }
}
