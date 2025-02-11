import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberModel } from '../entity/member.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchesService } from '../../churches.service';
import { CreateMemberDto } from '../dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { GetMemberDto } from '../dto/get-member.dto';
import { ResponsePaginationDto } from '../dto/response/response-pagination.dto';
import { ResponseGetDto } from '../dto/response/response-get.dto';
import { ResponseDeleteDto } from '../dto/response/response-delete.dto';
import { FamilyService } from './family.service';
import { MinistryModel } from '../../management/entity/ministry/ministry.entity';
import {
  DefaultMemberRelationOption,
  DefaultMemberSelectOption,
} from '../const/default-find-options.const';
import { GroupModel } from '../../management/entity/group/group.entity';
import { GroupRoleModel } from '../../management/entity/group/group-role.entity';
import { OfficerModel } from '../../management/entity/officer/officer.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MemberDeletedEvent } from '../events/member.event';
import { CreateFamilyDto } from '../dto/family/create-family.dto';
import { SearchMembersService } from './search-members.service';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(MemberModel)
    private readonly membersRepository: Repository<MemberModel>,
    private readonly churchesService: ChurchesService,
    private readonly familyService: FamilyService,
    private readonly eventEmitter: EventEmitter2,
    private readonly searchMembersService: SearchMembersService,
  ) {}

  private getMembersRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(MemberModel) : this.membersRepository;
  }

  async getMembers(churchId: number, dto: GetMemberDto, qr?: QueryRunner) {
    const membersRepository = this.getMembersRepository(qr);

    const selectOptions = this.searchMembersService.parseSelectOption(dto);

    const relationOptions = this.searchMembersService.parseRelationOption(dto);

    const whereOptions: FindOptionsWhere<MemberModel> =
      this.searchMembersService.parseWhereOption(churchId, dto);

    const findOptionsOrder: FindOptionsOrder<MemberModel> =
      this.searchMembersService.parseOrderOption(dto);

    const [totalCount, result] = await Promise.all([
      membersRepository.count({
        where: whereOptions,
      }),
      membersRepository.find({
        where: whereOptions,
        order: findOptionsOrder,
        relations: relationOptions,
        select: selectOptions,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
    ]);

    const totalPage = Math.ceil(totalCount / dto.take);

    return new ResponsePaginationDto<MemberModel>(
      result,
      result.length,
      dto.page,
      totalCount,
      totalPage,
    );
  }

  async getMemberById(churchId: number, memberId: number, qr?: QueryRunner) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: {
        id: memberId,
        churchId,
      },
      relations: DefaultMemberRelationOption,
      select: DefaultMemberSelectOption,
    });

    if (!member) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    return new ResponseGetDto<MemberModel>(member);
  }

  async getMemberModelById(
    churchId: number,
    memberId: number,
    relations?: FindOptionsRelations<MemberModel>,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: {
        id: memberId,
        churchId,
      },
      relations,
    });

    if (!member) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    return member;
  }

  async getMemberModelByNameAndMobilePhone(
    churchId: number,
    name: string,
    mobilePhone: string,
    relations?: FindOptionsRelations<MemberModel>,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: {
        churchId,
        name,
        mobilePhone,
      },
      relations,
    });

    if (!member) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    return member;
  }

  createDummyMemberModel(dto: CreateMemberDto & { churchId: number }) {
    return this.membersRepository.create(dto);
  }

  async createDummyMembers(
    churchId: number,
    members: MemberModel[],
    qr?: QueryRunner,
  ) {
    await this.churchesService.getChurchById(churchId, qr);

    const membersRepository = this.getMembersRepository(qr);

    return membersRepository.save(members);
  }

  async createMember(churchId: number, dto: CreateMemberDto, qr: QueryRunner) {
    //const church = await this.churchesService.getChurchById(churchId, qr);
    const church = await this.churchesService.getChurchModelById(churchId, qr);

    const membersRepository = this.getMembersRepository(qr);

    const isExist = await this.isExistMemberByNameAndMobilePhone(
      churchId,
      dto.name,
      dto.mobilePhone,
      qr,
    );

    if (isExist) {
      throw new BadRequestException('이미 존재하는 교인입니다.');
    }

    /*const existingMember = await membersRepository.findOne({
      where: {
        churchId,
        name: dto.name,
        mobilePhone: dto.mobilePhone,
      },
      withDeleted: true,
    });

    if (existingMember) {
      if (!existingMember.deletedAt) {
        throw new BadRequestException('이미 존재하는 교인입니다.');
      }

      await membersRepository.remove(existingMember);
    }*/

    // 인도자 처리
    if (dto.guidedById) {
      const isExistGuide = await this.isExistMemberById(
        churchId,
        dto.guidedById,
        qr,
      );

      if (!isExistGuide) {
        throw new NotFoundException(
          '같은 교회에 해당 교인이 존재하지 않습니다.',
        );
      }
    }

    const newMember = await membersRepository.save({ ...dto, church });

    // 가족 등록
    if (dto.familyMemberId && dto.relation) {
      await this.fetchFamilyRelation(
        churchId,
        newMember.id,
        dto.familyMemberId,
        dto.relation,
        qr,
      );
    }

    //return this.getMemberById(churchId, newMember.id, qr);

    const result = await membersRepository.findOne({
      where: { id: newMember.id },
    });

    if (!result) {
      throw new InternalServerErrorException('교인 생성 중 에러 발생');
    }
    return result;
  }

  async updateMember(
    churchId: number,
    memberId: number,
    dto: UpdateMemberDto,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    if (dto.guidedById) {
      const isExistGuide = await this.isExistMemberById(
        churchId,
        dto.guidedById,
        qr,
      );

      if (!isExistGuide) {
        throw new NotFoundException(
          '같은 교회에 해당 교인이 존재하지 않습니다.',
        );
      }
    }

    const result = await membersRepository.update(
      { id: memberId, churchId, deletedAt: IsNull() },
      { ...dto },
    );

    if (result.affected === 0) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    return this.getMemberModelById(
      churchId,
      memberId,
      DefaultMemberRelationOption,
      qr,
    );
    /*return membersRepository.findOne({
      where: { id: memberId },
      relations: { guiding: true, guidedBy: true },
    });*/
  }

  async deleteMember(
    churchId: number,
    memberId: number,
  ): Promise<ResponseDeleteDto> {
    const result = await this.membersRepository.softDelete({
      id: memberId,
      churchId,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    this.eventEmitter.emit(
      'member.deleted',
      new MemberDeletedEvent(churchId, memberId),
    );

    return {
      timestamp: new Date(),
      success: true,
      resultId: memberId,
    };
  }

  private async isExistMemberById(
    churchId: number,
    memberId: number,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: { churchId, id: memberId },
    });

    return !!member;
  }

  async isExistMemberByNameAndMobilePhone(
    churchId: number,
    name: string,
    mobilePhone: string,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: { churchId, name, mobilePhone },
    });

    return !!member;
  }

  async getFamilyRelation(
    churchId: number,
    memberId: number,
    qr?: QueryRunner,
  ) {
    const member = await this.getMemberModelById(churchId, memberId, {}, qr);

    return this.familyService.getFamilyMember(member);
  }

  async createFamilyRelation(
    churchId: number,
    memberId: number,
    dto: CreateFamilyDto,
    qr: QueryRunner,
  ) {
    const [member, familyMember] = await Promise.all([
      this.getMemberModelById(churchId, memberId, {}, qr),
      this.getMemberModelById(churchId, dto.familyMemberId, {}, qr),
    ]);

    return this.familyService.createFamilyMember(
      member,
      familyMember,
      dto.relation,
      qr,
    );
  }

  async fetchFamilyRelation(
    churchId: number,
    memberId: number,
    familyMemberId: number,
    relation: string,
    qr: QueryRunner,
  ) {
    const [member, familyMember] = await Promise.all([
      this.getMemberModelById(churchId, memberId, {}, qr),
      this.getMemberModelById(churchId, familyMemberId, {}, qr),
    ]);

    return this.familyService.fetchAndCreateFamilyRelation(
      member,
      familyMember,
      relation,
      qr,
    );
  }

  async patchFamilyRelation(
    churchId: number,
    memberId: number,
    familyMemberId: number,
    relation: string,
    qr: QueryRunner,
  ) {
    return this.familyService.updateFamilyRelation(
      churchId,
      memberId,
      familyMemberId,
      relation,
      qr,
    );
  }

  async deleteFamilyRelation(
    churchId: number,
    memberId: number,
    familyMemberId: number,
    qr?: QueryRunner,
  ) {
    return this.familyService.deleteFamilyRelation(
      churchId,
      memberId,
      familyMemberId,
      qr,
    );
  }

  async setMemberOfficer(
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

  async addMemberMinistry(
    member: MemberModel,
    ministry: MinistryModel,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const oldMinistries = member.ministries;

    member.ministries = [...oldMinistries, ministry];

    return membersRepository.save(member);
  }

  async removeMemberMinistry(
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

  async addMemberGroup(
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

  async removeMemberGroup(member: MemberModel, qr: QueryRunner) {
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
