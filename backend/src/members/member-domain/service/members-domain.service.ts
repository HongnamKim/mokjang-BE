import { IMembersDomainService } from '../interface/members-domain.service.interface';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberModel } from '../../entity/member.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  Not,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetMemberDto } from '../../dto/request/get-member.dto';
import {
  DefaultMemberRelationOption,
  DefaultMemberSelectOption,
} from '../../const/default-find-options.const';
import { MemberException } from '../../const/exception/member.exception';
import { CreateMemberDto } from '../../dto/request/create-member.dto';
import { UpdateMemberDto } from '../../dto/request/update-member.dto';
import { OfficerModel } from '../../../management/officers/entity/officer.entity';
import { MinistryModel } from '../../../management/ministries/entity/ministry.entity';
import { GroupModel } from '../../../management/groups/entity/group.entity';
import { GroupRoleModel } from '../../../management/groups/entity/group-role.entity';
import { MembersDomainPaginationResultDto } from '../dto/members-domain-pagination-result.dto';
import { GetSimpleMembersDto } from '../../dto/request/get-simple-members.dto';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../const/member-find-options.const';
import { GetRecommendLinkMemberDto } from '../../dto/request/get-recommend-link-member.dto';

@Injectable()
export class MembersDomainService implements IMembersDomainService {
  constructor(
    @InjectRepository(MemberModel)
    private readonly membersRepository: Repository<MemberModel>,
  ) {}

  private getMembersRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(MemberModel) : this.membersRepository;
  }

  async findMembers(
    dto: GetMemberDto,
    whereOptions: FindOptionsWhere<MemberModel>,
    orderOptions: FindOptionsOrder<MemberModel>,
    relationOptions: FindOptionsRelations<MemberModel>,
    selectOptions: FindOptionsSelect<MemberModel>,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const [totalCount, result] = await Promise.all([
      membersRepository.count({
        where: whereOptions,
      }),
      membersRepository.find({
        where: whereOptions,
        order: orderOptions,
        relations: relationOptions,
        select: selectOptions,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
    ]);

    return {
      data: result,
      totalCount,
    };
  }

  async findRecommendLinkMember(
    church: ChurchModel,
    dto: GetRecommendLinkMemberDto,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    return membersRepository.find({
      where: [
        {
          churchId: church.id,
          name: ILike(`%${dto.name}%`),
          mobilePhone: ILike(`%${dto.mobilePhone}%`),
        },
        {
          churchId: church.id,
          name: ILike(`%${dto.name}%`),
          mobilePhone: Not(ILike(`%${dto.mobilePhone}%`)),
        },
        {
          churchId: church.id,
          name: Not(ILike(`%${dto.name}%`)),
          mobilePhone: ILike(`%${dto.mobilePhone}%`),
        },
      ],
      relations: MemberSummarizedRelation,
      select: { ...MemberSummarizedSelect, mobilePhone: true },
    });
  }

  async findSimpleMembers(
    church: ChurchModel,
    dto: GetSimpleMembersDto,
    qr?: QueryRunner,
  ): Promise<MembersDomainPaginationResultDto> {
    const repository = this.getMembersRepository(qr);

    const whereOptions: FindOptionsWhere<MemberModel> = {
      churchId: church.id,
      name: ILike(`%${dto.name}%`),
      mobilePhone: dto.mobilePhone && ILike(`%${dto.mobilePhone}%`),
    };

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: whereOptions,
        relations: MemberSummarizedRelation,
        select: MemberSummarizedSelect,
      }),
      repository.count({
        where: whereOptions,
      }),
    ]);

    return new MembersDomainPaginationResultDto(data, totalCount);
  }

  async countAllMembers(church: ChurchModel, qr?: QueryRunner) {
    const membersRepository = this.getMembersRepository(qr);

    return membersRepository.count({
      where: {
        churchId: church.id,
      },
    });
  }

  async findMembersById(
    church: ChurchModel,
    ids: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel[]> {
    const repository = this.getMembersRepository(qr);

    const members = await repository.find({
      where: {
        churchId: church.id,
        id: In(ids),
      },
      relations: relationOptions,
    });

    if (members.length !== ids.length) {
      throw new NotFoundException(MemberException.NOT_FOUND_PARTIAL);
    }

    return members;
  }

  async findMemberById(
    church: ChurchModel,
    memberId: number,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: {
        id: memberId,
        churchId: church.id,
      },
      relations: DefaultMemberRelationOption,
      select: DefaultMemberSelectOption,
    });

    if (!member) {
      throw new NotFoundException(MemberException.NOT_FOUND);
    }

    return member;
  }

  /*async findMemberModelByUserId(
    church: ChurchModel,
    userId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: {
        userId,
        churchId: church.id,
      },
      relations: relationOptions,
    });

    if (!member) {
      throw new NotFoundException(MemberException.NOT_FOUND);
    }

    return member;
  }*/

  /*async linkUserToMember(
    member: MemberModel,
    user: UserModel,
    qr?: QueryRunner,
  ) {
    const repository = this.getMembersRepository(qr);

    const result = await repository.update(
      {
        id: member.id,
      },
      {
        user: user,
        //isPermissionActive: true,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(MemberException.LINK_ERROR);
    }

    return result;
  }*/

  async findMemberModelById(
    church: ChurchModel,
    memberId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: {
        id: memberId,
        churchId: church.id,
      },
      relations: relationOptions,
    });

    if (!member) {
      throw new NotFoundException(MemberException.NOT_FOUND);
    }

    return member;
  }

  async findDeleteMemberModelById(
    church: ChurchModel,
    memberId: number,
    relations?: FindOptionsRelations<MemberModel>,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: {
        id: memberId,
        churchId: church.id,
      },
      relations,
      withDeleted: true,
    });

    if (!member) {
      throw new NotFoundException(MemberException.NOT_FOUND);
    }

    return member;
  }

  async findMemberModelByNameAndMobilePhone(
    church: ChurchModel,
    name: string,
    mobilePhone: string,
    relationOptions?: FindOptionsRelations<MemberModel>,
    qr?: QueryRunner,
  ): Promise<MemberModel | null> {
    const membersRepository = this.getMembersRepository(qr);

    return membersRepository.findOne({
      where: {
        churchId: church.id,
        name,
        mobilePhone,
      },
      relations: relationOptions,
    });
  }

  async isExistMemberByNameAndMobilePhone(
    church: ChurchModel,
    name: string,
    mobilePhone: string,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: {
        churchId: church.id,
        name,
        mobilePhone,
      },
    });

    return !!member;
  }

  async isExistMemberById(
    church: ChurchModel,
    memberId: number,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: {
        churchId: church.id,
        id: memberId,
      },
    });

    return !!member;
  }

  async createMember(
    church: ChurchModel,
    dto: CreateMemberDto,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const isExist = await this.isExistMemberByNameAndMobilePhone(
      church,
      dto.name,
      dto.mobilePhone,
      qr,
    );

    if (isExist) {
      throw new ConflictException(MemberException.ALREADY_EXIST);
    }

    if (dto.guidedById) {
      const isExistGuide = await this.isExistMemberById(
        church,
        dto.guidedById,
        qr,
      );

      if (!isExistGuide) {
        throw new NotFoundException(MemberException.NOT_FOUND_GUIDE);
      }
    }

    return membersRepository.save({ ...dto, church });
  }

  async updateMember(
    church: ChurchModel,
    member: MemberModel,
    dto: UpdateMemberDto,
    qr?: QueryRunner,
  ) {
    // 인도자 존재 여부 확인
    if (dto.guidedById) {
      const isExistGuide = await this.isExistMemberById(
        church,
        dto.guidedById,
        qr,
      );

      if (!isExistGuide) {
        throw new NotFoundException(MemberException.NOT_FOUND_GUIDE);
      }
    }

    const membersRepository = this.getMembersRepository(qr);

    const result = await membersRepository.update(
      {
        id: member.id,
        churchId: church.id,
        deletedAt: IsNull(),
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(MemberException.UPDATE_ERROR);
    }

    return this.findMemberById(church, member.id, qr);
  }

  async deleteMember(
    church: ChurchModel,
    member: MemberModel,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const result = await membersRepository.softDelete({
      id: member.id,
      churchId: church.id,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(MemberException.DELETE_ERROR);
    }

    return result;
  }

  async startMemberOfficer(
    member: MemberModel,
    officer: OfficerModel,
    officerStartDate: Date,
    officerStartChurch: string,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    return membersRepository.update(
      { id: member.id },
      {
        officerId: officer.id,
        officerStartDate,
        officerStartChurch,
      },
    );
  }

  async endMemberOfficer(member: MemberModel, qr: QueryRunner) {
    const membersRepository = this.getMembersRepository(qr);

    return membersRepository.update(
      { id: member.id },
      {
        officerId: null,
        officerStartDate: null,
        officerStartChurch: null,
      },
    );
  }

  async startMemberMinistry(
    member: MemberModel,
    ministry: MinistryModel,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const oldMinistries = member.ministries;

    member.ministries = [...oldMinistries, ministry];

    return membersRepository.save(member);
  }

  endMemberMinistry(
    member: MemberModel,
    targetMinistry: MinistryModel,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    member.ministries = member.ministries.filter(
      (ministry) => ministry.id !== targetMinistry.id,
    );

    return membersRepository.save(member);
  }

  /*async endMemberEducation(
    member: MemberModel,
    educationEnrollmentId: number,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    member.educations = member.educations.filter(
      (educationEnrollment) => educationEnrollment.id !== educationEnrollmentId,
    );

    return membersRepository.save(member);
  }*/

  async startMemberGroup(
    member: MemberModel,
    group: GroupModel,
    groupRole: GroupRoleModel | undefined,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    return membersRepository.update(
      {
        id: member.id,
      },
      {
        group,
        groupRole,
      },
    );
  }

  async endMemberGroup(member: MemberModel, qr: QueryRunner) {
    const membersRepository = this.getMembersRepository(qr);

    return membersRepository.update(
      {
        id: member.id,
      },
      {
        groupId: null,
        groupRoleId: null,
      },
    );
  }
}
