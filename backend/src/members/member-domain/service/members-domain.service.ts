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
  Between,
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
  UpdateResult,
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
import { MembersDomainPaginationResultDto } from '../dto/members-domain-pagination-result.dto';
import { GetSimpleMembersDto } from '../../dto/request/get-simple-members.dto';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../const/member-find-options.const';
import { GetRecommendLinkMemberDto } from '../../dto/request/get-recommend-link-member.dto';
import { GetBirthdayMembersDto } from '../../../calendar/dto/request/birthday/get-birthday-members.dto';
import KoreanLunarCalendar from 'korean-lunar-calendar';
import { GroupRole } from '../../../management/groups/const/group-role.enum';
import { WidgetRange } from '../../../home/const/widget-range.enum';
import { GetNewMemberDetailDto } from '../../../home/dto/request/get-new-member-detail.dto';
import { NewMemberSummaryDto } from '../../../home/dto/new-member-summary.dto';
import { GetGroupMembersDto } from '../../../management/groups/dto/request/get-group-members.dto';
import { GroupMemberOrder } from '../../../management/groups/const/group-member-order.enum';
import { MinistryGroupModel } from '../../../management/ministries/entity/ministry-group.entity';
import { GetMinistryGroupMembersDto } from '../../../management/ministries/dto/ministry-group/request/get-ministry-group-members.dto';
import { MinistryGroupMemberOrder } from '../../../management/ministries/const/ministry-group-member-order.enum';

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

  async migrationBirthdayMMDD(church: ChurchModel) {
    const repository = this.getMembersRepository();

    await repository
      .createQueryBuilder()
      .update()
      .set({ birthdayMMDD: () => `to_char(birth, 'MM-DD')` })
      .where(
        `churchId = :churchId AND birth IS NOT NULL AND birthdayMMDD IS NULL`,
        {
          churchId: church.id,
        },
      )
      .execute();
  }

  async findBirthdayMembers(
    church: ChurchModel,
    dto: GetBirthdayMembersDto,
    qr?: QueryRunner,
  ): Promise<MemberModel[]> {
    const repository = this.getMembersRepository(qr);

    const fromLunarCalendar = new KoreanLunarCalendar();
    const toLunarCalendar = new KoreanLunarCalendar();

    // 음력 시작 날짜
    fromLunarCalendar.setSolarDate(
      dto.fromDate.getFullYear(),
      dto.fromDate.getMonth() + 1,
      dto.fromDate.getDate(),
    );

    // 음력 종료 날짜
    toLunarCalendar.setSolarDate(
      dto.toDate.getFullYear(),
      dto.toDate.getMonth() + 1,
      dto.toDate.getDate(),
    );

    const fromLunarObject = fromLunarCalendar.getLunarCalendar();
    const toLunarObject = toLunarCalendar.getLunarCalendar();

    const from = dto.fromDate.toISOString().slice(5, 10);
    const to = dto.toDate.toISOString().slice(5, 10);

    const fromLunar = `${fromLunarObject.month.toString().padStart(2, '0')}-${fromLunarObject.day.toString().padStart(2, '0')}`;
    const toLunar = `${toLunarObject.month.toString().padStart(2, '0')}-${toLunarObject.day.toString().padStart(2, '0')}`;

    const query = repository
      .createQueryBuilder('member')
      .select([
        'member.id',
        'member.churchId',
        'member.name',
        'member.profileImageUrl',
        'member.birth',
        'member.birthdayMMDD',
        'member.isLunar',
        'member.isLeafMonth',
        'member.groupRole',
      ])
      .where(`member.churchId = :churchId`, { churchId: church.id })
      .andWhere(
        `(
         (
          member.isLunar = false AND
            CASE
              WHEN :from <= :to THEN member.birthdayMMDD BETWEEN :from AND :to
              ELSE (member.birthdayMMDD >= :from) OR (member.birthdayMMDD <= :to)
            END
         )
        OR
        (
          member.isLunar = true AND
            CASE
              WHEN :fromLunar <= :toLunar THEN member.birthdayMMDD BETWEEN :fromLunar AND :toLunar
              ELSE (member.birthdayMMDD >= :fromLunar) OR (member.birthdayMMDD <= :toLunar)
            END
        ))`,
        { from, to, fromLunar, toLunar },
      )
      .leftJoin('member.officer', 'officer')
      .leftJoin('member.group', 'group')
      .addSelect(['officer.id', 'officer.name', 'group.id', 'group.name'])
      .orderBy('"birthdayMMDD"', 'ASC')
      .addOrderBy('birth', 'ASC')
      .addOrderBy('member.id', 'ASC');

    return query.getMany();
  }

  async findAllMembers(church: ChurchModel, qr?: QueryRunner) {
    const repository = this.getMembersRepository(qr);

    return repository.find({
      where: {
        churchId: church.id,
      },
      order: {
        id: 'asc',
      },
    });
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

  async findMinistryGroupMembersByIds(
    ministryGroup: MinistryGroupModel,
    memberIds: number[],
    qr?: QueryRunner,
  ) {
    const repository = this.getMembersRepository(qr);

    const ministryGroupMembers = await repository
      .createQueryBuilder('member')
      .select(['member.id', 'member.name'])
      .innerJoin('member.ministryGroups', 'ministryGroup')
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

    return membersRepository.save({
      ...dto,
      birthdayMMDD: dto.birth
        ? dto.birth.toISOString().slice(5, 10)
        : undefined,
      churchId: church.id,
    });
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
        birthdayMMDD: dto.birth
          ? dto.birth.toISOString().slice(5, 10)
          : undefined,
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

  async findMinistryGroupMembers(
    ministryGroup: MinistryGroupModel,
    dto: GetMinistryGroupMembersDto,
  ): Promise<MemberModel[]> {
    const repository = this.getMembersRepository();

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
    const repository = this.getMembersRepository(qr);
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

  async findMinistryGroupMemberModel(
    ministryGroup: MinistryGroupModel,
    memberId: number,
    qr?: QueryRunner,
    relations?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel> {
    const repository = this.getMembersRepository(qr);

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

  async startMemberMinistry(
    member: MemberModel,
    ministry: MinistryModel,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const oldMinistries = member.ministries;

    member.ministries = [...oldMinistries, ministry];

    return membersRepository.save(member);

    /*const existingCount = await membersRepository
      .createQueryBuilder('member', qr)
      .innerJoin('member.ministries', 'ministry')
      .where('member.id = :memberId', { memberId: member.id })
      .andWhere('ministry.id = :ministryId', { ministryId: ministry.id })
      .getCount();

    if (existingCount > 0) {
      throw new ConflictException('이미 해당 사역이 할당되어 있습니다.');
    }

    await membersRepository
      .createQueryBuilder('member')
      .relation(MemberModel, 'ministries')
      .of(member.id)
      .add(ministry.id);*/
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
    groupRole: GroupRole,
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
        groupRole: GroupRole.NONE,
      },
    );
  }

  async updateGroupRole(
    group: GroupModel,
    newLeaderMember: MemberModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getMembersRepository(qr);

    // 기존 리더를 다시 그룹원으로 수정
    await repository.update(
      { groupId: group.id, groupRole: GroupRole.LEADER },
      { groupRole: GroupRole.MEMBER },
    );

    // 새로운 리더 지정
    const result = await repository.update(
      { id: newLeaderMember.id },
      { groupRole: GroupRole.LEADER },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(MemberException.UPDATE_ERROR);
    }

    return result;
  }

  async findGroupMembers(
    church: ChurchModel,
    group: GroupModel,
    dto: GetGroupMembersDto,
    qr?: QueryRunner,
  ): Promise<MemberModel[]> {
    const repository = this.getMembersRepository(qr);

    // 그룹장 최상위 고정
    const order: FindOptionsOrder<MemberModel> = {
      groupRole: 'ASC',
    };

    if (dto.order === GroupMemberOrder.OFFICER) {
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
    });
  }

  async getNewMemberSummary(
    church: ChurchModel,
    range: WidgetRange,
    from: Date,
    to: Date,
  ): Promise<NewMemberSummaryDto[]> {
    const repository = this.getMembersRepository();

    const qb = repository.createQueryBuilder('member');

    if (range === WidgetRange.WEEKLY) {
      qb.select([
        `
        (
          DATE_TRUNC('day', member.registeredAt AT TIME ZONE 'UTC' AT TIME ZONE :tz)  -- 타임존 적용
          - (EXTRACT(DOW FROM (member.registeredAt AT TIME ZONE 'UTC') AT TIME ZONE :tz)::int) * INTERVAL '1 day'
        ) AS period_start
        `,
        `COUNT(*)::int AS count`,
      ]);
    } else {
      qb.select([
        `
          DATE_TRUNC('month',(member.registeredAt AT TIME ZONE 'UTC') AT TIME ZONE :tz) AS period_start
          `,
        `COUNT(*)::int AS count`,
      ]);
    }

    qb.where('member.churchId = :churchId', { churchId: church.id })
      .andWhere(`member.registeredAt BETWEEN :from AND :to`, {
        from,
        to,
      })
      .groupBy('period_start')
      .orderBy('period_start', 'ASC')
      .setParameters({
        tz: 'Asia/Seoul', // 원하는 타임존
      });

    const data: { period_start: string; count: number }[] =
      await qb.getRawMany();

    return data.map((d) => new NewMemberSummaryDto(d.period_start, d.count));
  }

  async findNewMemberDetails(
    church: ChurchModel,
    dto: GetNewMemberDetailDto,
    from: Date,
    to: Date,
  ): Promise<MemberModel[]> {
    const repository = this.getMembersRepository();

    return repository.find({
      where: {
        churchId: church.id,
        registeredAt: Between(from, to),
      },
      relations: MemberSummarizedRelation,
      select: { ...MemberSummarizedSelect, registeredAt: true },
      order: {
        [dto.order]: dto.orderDirection,
        id: 'ASC',
      },
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
  }
}
