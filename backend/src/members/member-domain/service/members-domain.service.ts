import { IMembersDomainService } from '../interface/members-domain.service.interface';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberModel } from '../../entity/member.entity';
import {
  Between,
  Brackets,
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
  SelectQueryBuilder,
  UpdateResult,
  WhereExpressionBuilder,
} from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberException } from '../../exception/member.exception';
import { CreateMemberDto } from '../../dto/request/create-member.dto';
import { UpdateMemberDto } from '../../dto/request/update-member.dto';
import { GetSimpleMembersDto } from '../../dto/request/get-simple-members.dto';
import {
  MemberSimpleSelectQB,
  MemberSummarizedGroupSelectQB,
  MemberSummarizedOfficerSelectQB,
  MemberSummarizedRelation,
  MemberSummarizedSelect,
  MemberSummarizedSelectQB,
} from '../../const/member-find-options.const';
import { GetRecommendLinkMemberDto } from '../../dto/request/get-recommend-link-member.dto';
import { GetBirthdayMembersDto } from '../../../calendar/dto/request/birthday/get-birthday-members.dto';
import KoreanLunarCalendar from 'korean-lunar-calendar';
import { GroupRole } from '../../../management/groups/const/group-role.enum';
import { WidgetRange } from '../../../home/const/widget-range.enum';
import { GetNewMemberDetailDto } from '../../../home/dto/request/get-new-member-detail.dto';
import { NewMemberSummaryDto } from '../../../home/dto/new-member-summary.dto';
import { GetMemberListDto } from '../../dto/list/get-member-list.dto';
import { MemberSortColumn } from '../../const/enum/list/sort-column.enum';
import { MemberDisplayColumn } from '../../const/enum/list/display-column.enum';
import { MarriageStatusFilter } from '../../const/enum/list/marriage-status-filter.enum';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import {
  getFromDate,
  getToDate,
} from '../../../member-history/history-date.utils';
import { GetSimpleMemberListDto } from '../../dto/list/get-simple-member-list.dto';
import { GetMemberDto } from '../../dto/request/get-member.dto';
import { WorshipGroupIdsVo } from '../../../worship/vo/worship-group-ids.vo';

@Injectable()
export class MembersDomainService implements IMembersDomainService {
  constructor(
    @InjectRepository(MemberModel)
    private readonly membersRepository: Repository<MemberModel>,
  ) {}

  private getMembersRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(MemberModel) : this.membersRepository;
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
      .select([...MemberSummarizedSelectQB, 'member.birthdayMMDD'])
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
      .addSelect([
        ...MemberSummarizedOfficerSelectQB,
        ...MemberSummarizedGroupSelectQB,
      ])
      .orderBy('"birthdayMMDD"', 'ASC')
      .addOrderBy('birth', 'ASC')
      .addOrderBy('member.id', 'ASC');

    return query.getMany();
  }

  async findAllMemberIds(church: ChurchModel, qr?: QueryRunner) {
    const repository = this.getMembersRepository(qr);

    return repository.find({
      where: {
        churchId: church.id,
      },
      select: {
        id: true,
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

  async findSimpleMemberList(church: ChurchModel, dto: GetSimpleMemberListDto) {
    const repository = this.getMembersRepository();

    const query = repository
      .createQueryBuilder('member')
      .where('member.churchId = :churchId', { churchId: church.id })
      .select(MemberSimpleSelectQB)
      .leftJoin('member.group', 'group')
      .addSelect(MemberSummarizedGroupSelectQB)
      .leftJoin('member.officer', 'officer')
      .addSelect(MemberSummarizedOfficerSelectQB)
      .orderBy(`member.${dto.sortBy}`, dto.sortDirection)
      .addOrderBy('member.id', dto.sortDirection);

    if (dto.name) {
      const searchWithoutSpace = dto.name.replaceAll(' ', '');
      const pattern = `%${searchWithoutSpace}%`;

      query.andWhere(`REPLACE(member.name, ' ', '') LIKE :name`, {
        name: pattern,
      });
    }

    if (dto.mobilePhone) {
      query.andWhere('member.mobilePhone LIKE :mobilePhone', {
        mobilePhone: `%${dto.mobilePhone}%`,
      });
    }

    if (dto.cursor) {
      this.applyCursorPagination(
        query,
        dto.cursor,
        MemberSortColumn.REGISTERED_AT,
        dto.sortDirection,
      );
    }

    const items = await query.limit(dto.limit + 1).getMany();

    const hasMore = items.length > dto.limit;
    if (hasMore) {
      items.pop(); // 추가로 가져온 마지막 항목 제거
    }

    // 커서 생성
    const nextCursor =
      hasMore && items.length > 0
        ? this.encodeCursor(
            items[items.length - 1],
            MemberSortColumn.REGISTERED_AT,
          )
        : undefined;

    return {
      items,
      nextCursor,
      hasMore,
    };
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

    const member = await membersRepository
      .createQueryBuilder('member')
      .leftJoin('member.churchUser', 'churchUser')
      .addSelect(['churchUser.id', 'churchUser.role'])
      .leftJoin('member.guidedBy', 'guidedBy')
      .addSelect(['guidedBy.id', 'guidedBy.name', 'guidedBy.profileImageUrl'])
      .leftJoin(
        'member.officerHistory',
        'officer_history',
        'officer_history.endDate IS NULL',
      )
      .addSelect(['officer_history.id', 'officer_history.startDate'])
      .leftJoin('officer_history.officer', 'officer_history_officer')
      .addSelect(['officer_history_officer.id', 'officer_history_officer.name'])
      .leftJoin('member.group', 'group')
      .addSelect(['group.id', 'group.name'])
      .leftJoin(
        'member.groupHistory',
        'group_history',
        'group_history.endDate IS NULL',
      )
      .addSelect([
        'group_history.id',
        'group_history.groupId',
        'group_history.startDate',
      ])
      .leftJoin('group_history.group', 'group_history_group')
      .addSelect(['group_history_group.id', 'group_history_group.name'])
      .leftJoin(
        'group_history.groupDetailHistory',
        'group_detail_history',
        'group_detail_history.endDate IS NULL',
      )
      .addSelect([
        'group_detail_history.id',
        'group_detail_history.role',
        'group_detail_history.startDate',
      ])
      .where('member.churchId = :churchId', { churchId: church.id })
      .andWhere('member.id = :memberId', { memberId })
      .getOne();

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

  async createBulkMembers(
    church: ChurchModel,
    createBulkMemberDto: CreateMemberDto[],
  ): Promise<boolean> {
    const repository = this.getMembersRepository();

    const members = repository.create(
      createBulkMemberDto.map((dto) => ({
        ...dto,
        churchId: church.id,
      })),
    );

    await repository.save(members, { chunk: 100 });

    return true;
  }

  async createMember(
    church: ChurchModel,
    dto: CreateMemberDto,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    /*const isExist = await this.isExistMemberByNameAndMobilePhone(
      church,
      dto.name,
      dto.mobilePhone,
      qr,
    );

    if (isExist) {
      throw new ConflictException(MemberException.ALREADY_EXIST);
    }*/

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
      registeredAt: dto.utcRegisteredAt,
      birth: dto.utcBirth,
      birthdayMMDD: dto.utcBirth
        ? dto.utcBirth.toISOString().slice(5, 10)
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

    const partialEntity = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key === 'registeredAt' && dto.utcRegisteredAt) {
        partialEntity[key] = dto.utcRegisteredAt;
      } else if (key === 'birth' && dto.utcBirth) {
        partialEntity[key] = dto.utcBirth;
        partialEntity['birthdayMMDD'] = dto.utcBirth.toISOString().slice(5, 10);
      } else if (key === 'utcBirth' || key === 'utcRegisteredAt') {
      } else {
        partialEntity[key] = value;
      }
    }

    const result = await membersRepository.update(
      {
        id: member.id,
        churchId: church.id,
        deletedAt: IsNull(),
      },
      {
        ...partialEntity,
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

  async updateGroupRole(
    member: MemberModel,
    groupRole: GroupRole,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getMembersRepository(qr);

    // 새로운 리더 지정
    const result = await repository.update({ id: member.id }, { groupRole });

    if (result.affected === 0) {
      throw new InternalServerErrorException(MemberException.UPDATE_ERROR);
    }

    return result;
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

  async getMemberListWithPagination(
    church: ChurchModel,
    dto: GetMemberListDto,
    groupIds: number[] | null | undefined,
  ) {
    const repository = this.getMembersRepository();

    const { cursor, limit, displayColumns } = dto;

    const query = repository
      .createQueryBuilder('member')
      .leftJoin('member.churchUser', 'churchUser')
      .select([
        'member.id',
        'member.name',
        'member.profileImageUrl',
        'member.groupRole',
        'member.ministryGroupRole',
        'churchUser.id',
        'churchUser.role',
      ])
      .where('member.churchId = :churchId', { churchId: church.id });

    // 사용자가 선택한 컬럼 SELECT
    displayColumns.forEach((column) => {
      switch (column) {
        case MemberDisplayColumn.OFFICER:
          query
            .leftJoin('member.officer', 'officer')
            .addSelect(['officer.id', 'officer.name']);
          break;
        case MemberDisplayColumn.GROUP:
          query
            .leftJoin('member.group', 'group')
            .addSelect(['group.id', 'group.name']);
          break;
        case MemberDisplayColumn.BIRTH:
          query.addSelect([
            'member.birth',
            'member.isLunar',
            'member.isLeafMonth',
          ]);
          break;
        default:
          query.addSelect(`member.${column}`);
      }
    });

    // 정렬에 필요한 컬럼이 SELECT 되지 않았다면 추가
    switch (dto.sortBy) {
      case MemberSortColumn.OFFICER:
        if (!displayColumns.includes(MemberDisplayColumn.OFFICER))
          query
            .leftJoin('member.officer', 'officer')
            .addSelect(['officer.id', 'officer.name']);
        break;
      case MemberSortColumn.GROUP:
        if (!displayColumns.includes(MemberDisplayColumn.GROUP))
          query
            .leftJoin('member.group', 'group')
            .addSelect(['group.id', 'group.name']);
        break;
      default:
        const sortColumn = this.getSortColumnPath(dto.sortBy);
        if (!sortColumn.startsWith('member.')) break;
        query.addSelect(sortColumn);
    }

    this.applyFilters(query, dto, groupIds);
    this.applySearch(query, dto.search);

    // 정렬 적용 (1순위: 사용자 지정(기본값-등록일자), 2순위: ID)
    this.applySorting(query, dto.sortBy, dto.sortDirection);

    // 커서가 있으면 해당 위치부터 조회
    if (cursor) {
      this.applyCursorPagination(query, cursor, dto.sortBy, dto.sortDirection);
    }

    // limit + 1개를 조회해서 다음 페이지 존재 여부 확인
    const items = await query.limit(limit + 1).getMany();

    const hasMore = items.length > limit;
    if (hasMore) {
      items.pop(); // 추가로 가져온 마지막 항목 제거
    }

    // 커서 생성
    const nextCursor =
      hasMore && items.length > 0
        ? this.encodeCursor(items[items.length - 1], dto.sortBy)
        : undefined;

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  private applySearch(query: SelectQueryBuilder<MemberModel>, search?: string) {
    if (!search || search.length < 2) return;

    const searchWithoutSpace = search.replaceAll(' ', '');
    const pattern = `%${searchWithoutSpace}%`;

    const aliases = query.expressionMap.aliases.map((a) => a.name);
    if (!aliases.includes('officer')) {
      query.leftJoin('member.officer', 'officer');
    }
    if (!aliases.includes('group')) {
      query.leftJoin('member.group', 'group');
    }

    query.andWhere(
      new Brackets((qb) => {
        // 텍스트 필드 검색
        this.addSearchCondition(qb, 'member.name', pattern);
        this.addSearchCondition(qb, 'member.address', pattern);
        this.addSearchCondition(qb, 'member.school', pattern);
        this.addSearchCondition(qb, 'member.occupation', pattern);
        this.addSearchCondition(qb, 'officer.name', pattern);
        this.addSearchCondition(qb, 'group.name', pattern);

        // 차랑 번호 검색
        qb.orWhere('member."vehicleNumber"::text LIKE :vehiclePattern', {
          vehiclePattern: pattern,
        });

        // 전화번호 검색
        qb.orWhere('member.mobilePhone LIKE :phonePattern', {
          phonePattern: pattern,
        }).orWhere('member.homePhone LIKE :homePhonePattern', {
          homePhonePattern: pattern,
        });
      }),
    );
  }

  private addSearchCondition(
    qb: WhereExpressionBuilder,
    field: string,
    pattern: string,
  ) {
    const paramName = field.replace(/[.]/g, '_') + '_search';

    qb.orWhere(`REPLACE(${field}, ' ', '') LIKE :${paramName}`, {
      [paramName]: pattern,
    });
  }

  private applyFilters(
    query: SelectQueryBuilder<MemberModel>,
    filter: GetMemberListDto,
    groupIds: number[] | null | undefined,
  ) {
    // 1. 직분 필터 (OR 조건, NULL 처리)
    if (filter.officerIds && filter.officerIds.length > 0) {
      const hasNull = filter.officerIds.includes('null');
      const realIds = filter.officerIds.filter(
        (id) => id !== 'null',
      ) as number[];

      if (hasNull && realIds.length > 0) {
        query.andWhere(
          '(member.officerId IN (:...officerIds) OR member.officerId IS NULL)',
          { officerIds: realIds },
        );
      } else if (hasNull) {
        query.andWhere('(member.officerId IS NULL)');
      } else if (realIds.length > 0) {
        query.andWhere('member.officerId IN (:...officerIds)', {
          officerIds: realIds,
        });
      }
    }

    // 2. 그룹 필터
    //query.andWhere('(member.groupId = :groupIds)', { groupIds: 3 });
    if (groupIds === null) {
      query.andWhere('(member.groupId IS NULL)');
    } else if (groupIds === undefined) {
    } else {
      console.log('dd');
      query.andWhere('member.groupId IN (:...groupIds)', {
        groupIds,
      });
    }
    /*if (filter.groupIds && filter.groupIds.length > 0) {
      const hasNull = filter.groupIds.includes('null');
      const realIds = filter.groupIds.filter((id) => id !== 'null') as number[];

      if (hasNull && realIds.length > 0) {
        query.andWhere(
          '(member.groupId IN (:...groupIds) OR member.groupId is NULL)',
          { groupIds: realIds },
        );
      } else if (hasNull) {
        query.andWhere('(member.groupId IS NULL)');
      } else if (realIds.length > 0) {
        query.andWhere('member.groupId IN (:...groupIds)', {
          groupIds: realIds,
        });
      }
    }*/

    // 3. 결혼 상태 필터 (OR 조건, NULL 처리)
    if (filter.marriageStatuses && filter.marriageStatuses.length > 0) {
      const hasNull = filter.marriageStatuses.includes(
        MarriageStatusFilter.NULL,
      );
      const realStatuses = filter.marriageStatuses.filter(
        (s) => s !== MarriageStatusFilter.NULL,
      );

      if (hasNull && realStatuses.length > 0) {
        query.andWhere(
          '(member.marriage IN (:...marriageStatuses) OR member.marriage IS NULL)',
          { marriageStatuses: realStatuses },
        );
      } else if (hasNull) {
        query.andWhere('member.marriage IS NULL');
      } else if (realStatuses.length > 0) {
        query.andWhere('member.marriage IN (:...marriageStatuses)', {
          marriageStatuses: realStatuses,
        });
      }
    }

    // 4. 신급 필터
    if (filter.baptismStatuses && filter.baptismStatuses.length > 0) {
      query.andWhere('member.baptism IN (:...baptismStatuses)', {
        baptismStatuses: filter.baptismStatuses,
      });
    }

    // 5. 생년월일 범위 필터
    if (filter.birthFrom) {
      const birthFrom = getFromDate(filter.birthFrom, TIME_ZONE.SEOUL);

      query.andWhere('member.birth >= :birthFrom', {
        birthFrom: birthFrom,
      });
    }
    if (filter.birthTo) {
      const birthTo = getToDate(filter.birthTo, TIME_ZONE.SEOUL);

      query.andWhere('member.birth <= :birthTo', { birthTo });
    }

    // 6. 등록일 범위 필터
    if (filter.registeredFrom) {
      const registeredFrom = getFromDate(
        filter.registeredFrom,
        TIME_ZONE.SEOUL,
      );

      query.andWhere('member.registeredAt >= :registeredFrom', {
        registeredFrom: registeredFrom,
      });
    }
    if (filter.registeredTo) {
      const registeredTo = getToDate(filter.registeredTo, TIME_ZONE.SEOUL);

      query.andWhere('member.registeredAt <= :registeredTo', {
        registeredTo: registeredTo,
      });
    }
  }

  private applySorting(
    query: SelectQueryBuilder<MemberModel>,
    sortBy: MemberSortColumn,
    sortDirection: 'ASC' | 'DESC',
  ) {
    switch (sortBy) {
      case MemberSortColumn.OFFICER:
        query.orderBy('officer.name', sortDirection);
        break;
      case MemberSortColumn.GROUP:
        query.orderBy('group.name', sortDirection);
        break;
      default:
        query.orderBy(`member.${sortBy}`, sortDirection);
        break;
    }

    query.addOrderBy('member.id', 'ASC');
  }

  private applyCursorPagination(
    query: SelectQueryBuilder<MemberModel>,
    cursor: string,
    sortBy: MemberSortColumn,
    sortDirection: 'ASC' | 'DESC',
  ) {
    const decodedCursor = this.decodeCursor(cursor);
    // 커서가 없는 경우
    if (!decodedCursor) return;

    // 커서와 정렬 조건이 다른 경우
    if (decodedCursor.column !== sortBy) return;

    const { id, value } = decodedCursor;

    const column = this.getSortColumnPath(sortBy);

    // 마지막 교인의 정렬 조건 값이 null 인 경우 (그룹명, 직분명)
    if (value === null) {
      if (sortDirection === 'ASC') {
        query.andWhere(
          `(${column} IS NOT NULL OR (${column} IS NULL AND member.id > :id))`,
          { id },
        );
      } else {
        query.andWhere(`member.id > :id`, { id });
      }
    } else {
      if (sortDirection === 'ASC') {
        query.andWhere(
          `(${column} > :value OR (${column} = :value AND member.id > :id) OR (${column} IS NULL))`,
          { value, id },
        );
      } else {
        query.andWhere(
          `(${column} < :value OR (${column} = :value AND member.id > :id))`,
          { value, id },
        );
      }
    }
  }

  private getSortColumnPath(sortBy: MemberSortColumn): string {
    switch (sortBy) {
      case MemberSortColumn.OFFICER:
        return 'officer.name';
      case MemberSortColumn.GROUP:
        return 'group.name';
      default:
        return `member.${sortBy}`;
    }
  }

  private encodeCursor(member: MemberModel, sortBy: MemberSortColumn) {
    let value: any;

    switch (sortBy) {
      case MemberSortColumn.OFFICER:
        value = member.officer?.name || null;
        break;
      case MemberSortColumn.GROUP:
        value = member.group?.name || null;
        break;
      default:
        value = member[sortBy];
        break;
    }

    const cursorData = {
      id: member.id,
      value,
      column: sortBy,
    };

    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }

  private decodeCursor(cursor: string) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
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

  async findSimpleMembers(
    church: ChurchModel,
    dto: GetSimpleMembersDto,
    qr?: QueryRunner,
  ): Promise<MemberModel[]> {
    const repository = this.getMembersRepository(qr);

    const whereOptions: FindOptionsWhere<MemberModel> = {
      churchId: church.id,
      name: dto.name && ILike(`%${dto.name}%`),
      mobilePhone: dto.mobilePhone && ILike(`%${dto.mobilePhone}%`),
    };

    return repository.find({
      where: whereOptions,
      relations: MemberSummarizedRelation,
      order: {
        [dto.order]: dto.orderDirection,
        id: dto.orderDirection,
      },
      select: {
        id: true,
        name: true,
        profileImageUrl: true,
        registeredAt: true,
        officer: {
          id: true,
          name: true,
        },
        group: {
          id: true,
          name: true,
        },
        groupRole: true,
        ministryGroupRole: true,
      },
    });
  }

  getGroupMembersCount(
    church: ChurchModel,
    requestGroupIds: WorshipGroupIdsVo,
    qr?: QueryRunner,
  ): Promise<number> {
    const repository = this.getMembersRepository(qr);

    let groupId: any;

    if (requestGroupIds.groupIds.length && !requestGroupIds.isAllGroups) {
      groupId = In(requestGroupIds.groupIds);
    } else if (!requestGroupIds.isAllGroups) {
      groupId = IsNull();
    } else {
      groupId = undefined;
    }

    return repository.count({
      where: {
        churchId: church.id,
        groupId: groupId,
      },
    });
  }
}
