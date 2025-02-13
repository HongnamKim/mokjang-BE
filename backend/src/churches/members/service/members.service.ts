import {
  BadRequestException,
  ConflictException,
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
  Not,
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

    /*const isExist = await this.isExistMemberByNameAndMobilePhone(
      churchId,
      dto.name,
      dto.mobilePhone,
      qr,
    );

    if (isExist) {
      throw new BadRequestException('이미 존재하는 교인입니다.');
    }*/

    const existingMember = await membersRepository.findOne({
      where: {
        churchId,
        name: dto.name,
        mobilePhone: dto.mobilePhone,
      },
      withDeleted: true,
    });

    if (existingMember) {
      if (existingMember.deletedAt) {
        throw new ConflictException(
          '동일한 이름, 전화번호의 교인 이력 존재합니다. 복구 또는 완전 삭제해주세요.',
        );
      } else {
        throw new BadRequestException('이미 존재하는 교인입니다.');
      }
    }

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

  private async cascadeDeleteMember(
    churchId: number,
    deletedMember: MemberModel,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);
    // 인도자 relation 끊기
    // 삭제 대상에게 인도된 사람들
    await membersRepository.update(
      { guidedById: deletedMember.id, churchId },
      { guidedById: null },
    );

    // 가족 관계 삭제
    await this.familyService.cascadeRemoveAllFamilyRelations(
      deletedMember.id,
      qr,
    );
    // 사역 종료 + 삭제
    await this.endAllMemberMinistry(deletedMember, qr);

    // 직분 종료 + 삭제
    await this.endMemberOfficer(deletedMember, qr);

    // 교육 삭제

    // 그룹 종료 + 삭제
    await this.endMemberGroup(deletedMember, qr);
  }

  // 교인 soft delete
  // 교육 등록도 soft delete
  async deleteMember(
    churchId: number,
    memberId: number,
    qr: QueryRunner,
  ): Promise<ResponseDeleteDto> {
    const result = await this.membersRepository.softDelete({
      id: memberId,
      churchId,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    // 가족 관계 모두 삭제
    //await this.familyService.cascadeDeleteAllFamilyRelation(memberId, qr);

    // 이벤트는 트랜잭션 처리 불가능 본 요청과 이벤트 요청은 서로 달라서 본 요청 응답이 나갈 때
    // 트랜잭션이 끝나게 되어 이벤트 요청에서 트랜잭션 처리를 할 수 없음
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

  // soft delete 된 교인 복구
  // 교인에 딸린 educationEnrollment 복구
  async restoreMember(churchId: number, memberId: number, qr: QueryRunner) {
    const membersRepository = this.getMembersRepository(qr);

    const restoreTarget = await membersRepository.findOne({
      where: {
        churchId,
        id: memberId,
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
    });

    if (!restoreTarget) {
      throw new NotFoundException('복구 대상을 찾을 수 없습니다.');
    }

    await membersRepository.restore({ id: restoreTarget.id });

    return this.getMemberById(churchId, memberId, qr);
  }

  // 교인 완전 삭제
  async hardDeleteMember(churchId: number, memberId: number, qr: QueryRunner) {}

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
    const [me, family] = await Promise.all([
      this.getMemberModelById(churchId, memberId, {}, qr),
      this.getMemberModelById(churchId, familyMemberId, {}, qr),
    ]);

    return this.familyService.updateFamilyRelation(
      churchId,
      me,
      family,
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
    const [me, family] = await Promise.all([
      this.getMemberModelById(churchId, memberId, {}, qr),
      this.getMemberModelById(churchId, familyMemberId, {}, qr),
    ]);

    return this.familyService.deleteFamilyRelation(churchId, me, family, qr);
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

  async endMemberEducation(
    member: MemberModel,
    educationEnrollmentId: number,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    member.educations = member.educations.filter(
      (educationEnrollment) => educationEnrollment.id !== educationEnrollmentId,
    );

    return membersRepository.save(member);
  }

  async endMemberMinistry(
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

  async endAllMemberMinistry(member: MemberModel, qr: QueryRunner) {
    const membersRepository = this.getMembersRepository(qr);

    member.ministries = [];

    return membersRepository.save(member);
  }

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
