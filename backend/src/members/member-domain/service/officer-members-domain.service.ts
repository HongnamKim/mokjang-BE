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
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../const/member-find-options.const';
import { OfficerModel } from '../../../management/officers/entity/officer.entity';
import { GetOfficerMembersDto } from '../../../management/officers/dto/request/members/get-officer-members.dto';
import { MemberException } from '../../exception/member.exception';

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
      },
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
  }

  findOfficerMembers(
    church: ChurchModel,
    officer: OfficerModel,
    dto: GetOfficerMembersDto,
    qr?: QueryRunner,
  ): Promise<MemberModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
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
    });
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
