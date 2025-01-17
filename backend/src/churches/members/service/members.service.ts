import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberModel } from '../entity/member.entity';
import {
  ArrayContains,
  Between,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
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
import { GetMemberOrderEnum } from '../../enum/get-member-order.enum';
import { UpdateMemberOfficerDto } from '../../members-settings/dto/update-member-officer.dto';
import { UpdateMemberMinistryDto } from '../../members-settings/dto/update-member-ministry.dto';
import { MinistryModel } from '../../settings/entity/ministry/ministry.entity';
import {
  DefaultMemberSelectOption,
  DefaultMembersRelationOption,
  DefaultMembersSelectOption,
} from '../const/default-find-options.const';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(MemberModel)
    private readonly membersRepository: Repository<MemberModel>,
    private readonly churchesService: ChurchesService,
    private readonly familyService: FamilyService,
  ) {}

  private CHURCH_SETTING_COLUMNS = [
    'group',
    'ministries',
    'educations',
    'officer',
  ];

  private SELECT_PREFIX = 'select__';

  private PAGING_OPTIONS = ['take', 'page', 'order', 'orderDirection'];

  private getMembersRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(MemberModel) : this.membersRepository;
  }

  parseRelationOption(dto: GetMemberDto) {
    const relationOptions: FindOptionsRelations<MemberModel> = {};

    let needDefaultRelationOptions = true;

    Object.entries(dto).forEach(([key, value]) => {
      if (key.startsWith(this.SELECT_PREFIX)) {
        const [, column] = key.split('__');

        needDefaultRelationOptions = false;

        if (this.CHURCH_SETTING_COLUMNS.includes(column)) {
          if (column === 'educations') {
            relationOptions['educationHistory'] = value;
          }
          relationOptions[column] = value;
        }

        return;
      }

      /*if (key === 'educationStatus' || key === 'educationHistory') {
        relationOptions['educationHistory'] = true;
        return;
      }*/

      // 컬럼 사용자화 없이 필터링을 걸었을 경우
      if (this.CHURCH_SETTING_COLUMNS.includes(key)) {
        if (key === 'educations') {
          relationOptions['educationHistory'] = value;
        }
        relationOptions[key] = true;

        return;
      }
    });

    if (needDefaultRelationOptions) {
      Object.keys(DefaultMembersRelationOption).forEach((key) => {
        relationOptions[key] = true;
      });
    }

    // 정렬 기준이 join 이 필요한 컬럼인 경우
    if (this.CHURCH_SETTING_COLUMNS.includes(dto.order)) {
      relationOptions[dto.order as string] = true;
    }

    return relationOptions;
  }

  parseOrderOption(dto: GetMemberDto) {
    const findOptionsOrder: FindOptionsOrder<MemberModel> = {};

    if (
      dto.order === GetMemberOrderEnum.group ||
      dto.order === GetMemberOrderEnum.officer
    ) {
      findOptionsOrder[dto.order as string] = {
        name: dto.orderDirection,
      };
      findOptionsOrder.registeredAt = 'asc';
    } else {
      findOptionsOrder[dto.order as string] = dto.orderDirection;
      if (dto.order !== GetMemberOrderEnum.registeredAt) {
        findOptionsOrder.registeredAt = 'asc';
      }
    }

    return findOptionsOrder;
  }

  parseSelectOption(dto: GetMemberDto) {
    const selectOptions: FindOptionsSelect<MemberModel> = {};

    let needDefaultSelectOptions = true;

    // 컬럼 사용자화
    Object.entries(dto).forEach(([key, value]) => {
      if (this.PAGING_OPTIONS.includes(key)) return;

      if (key.startsWith(this.SELECT_PREFIX)) {
        const [, column] = key.split('__');

        if (this.CHURCH_SETTING_COLUMNS.includes(column)) {
          if (column === 'educations') {
            selectOptions['educationHistory'] = {
              id: true,
              educationId: true,
              educationName: true,
              status: true,
            };
          } else if (column === 'group') {
            selectOptions[column] = {
              id: true,
              groupId: true,
              groupName: true,
              startDate: true,
              endDate: true,
            };
          }

          selectOptions[column] = {
            id: value,
            name: value,
          };
        } else if (column === 'address') {
          // 도로명 주소 선택 시 상제 주소 추가
          selectOptions[column] = value;
          selectOptions['detailAddress'] = value;
        } else if (column === 'birth') {
          // 생년월일 추가 시 음력여부 추가
          selectOptions[column] = value;
          selectOptions['isLunar'] = value;
        } else {
          selectOptions[column] = value;
        }

        needDefaultSelectOptions = false;
      }
    });

    // 항상 들어가야할 컬럼
    const result: FindOptionsSelect<MemberModel> = {
      id: true,
      registeredAt: true,
      name: true,
      [dto.order]: this.CHURCH_SETTING_COLUMNS.includes(dto.order)
        ? { id: true, name: true }
        : true,
    };

    // 필터링 선택한 컬럼
    Object.keys(dto).forEach((key) => {
      if (
        this.PAGING_OPTIONS.includes(key) ||
        key.startsWith(this.SELECT_PREFIX) ||
        key === 'educationStatus'
      )
        return;

      if (this.CHURCH_SETTING_COLUMNS.includes(key)) {
        if (key === 'educations') {
          result['educationHistory'] = {
            id: true,
            educationName: true,
            status: true,
            educationId: true,
          };
        } else if (key === 'group') {
          result[key] = {
            id: true,
            groupId: true,
            groupName: true,
            startDate: true,
            endDate: true,
          };
        } else {
          result[key] = {
            id: true,
            name: true,
          };
        }
        return;
      }

      if (key === 'registerAfter' || key === 'registerBefore') {
        result['registeredAt'] = true;
        return;
      }

      if (key === 'birthAfter' || key === 'birthBefore') {
        result['birth'] = true;
        return;
      }

      if (key === 'updateAfter' || key === 'updateBefore') {
        result['updatedAt'] = true;
        return;
      }

      result[key] = true;
    });

    return needDefaultSelectOptions
      ? { ...result, ...DefaultMembersSelectOption }
      : { ...result, ...selectOptions };
  }

  async parseWhereOption(churchId: number, dto: GetMemberDto) {
    const createDateFilter = (start?: Date, end?: Date) =>
      start && end
        ? Between(start, end)
        : start
          ? MoreThanOrEqual(start)
          : end
            ? LessThanOrEqual(end)
            : undefined;

    const findOptionsWhere: FindOptionsWhere<MemberModel> = {
      churchId,
      name: dto.name && ILike(`%${dto.name}%`),
      mobilePhone: dto.mobilePhone && Like(`%${dto.mobilePhone}%`),
      homePhone: dto.homePhone && Like(`%${dto.homePhone}%`),
      address: dto.address && Like(`%${dto.address}%`),
      birth: createDateFilter(dto.birthAfter, dto.birthBefore),
      registeredAt: createDateFilter(dto.registerAfter, dto.registerBefore),
      updatedAt: createDateFilter(dto.updateAfter, dto.updateBefore),
      gender: dto.gender && In(dto.gender), //dto?.gender,
      marriage: dto.marriage && In(dto.marriage), //dto?.marriage,
      school: dto.school && Like(`%${dto.school}%`),
      occupation: dto.occupation && Like(`%${dto.occupation}%`),
      vehicleNumber: dto.vehicleNumber && ArrayContains(dto.vehicleNumber),
      baptism: dto.baptism && In(dto.baptism),
      //groupId: dto.group && In(dto.group),
      group: dto.group && {
        groupId: In(dto.group),
        endDate: IsNull(),
      },
      officerId: dto.officer && In(dto.officer),
      //ministries: dto.ministries && { id: In(dto.ministries) },
      //educations: dto.educations && { id: In(dto.educations) },
      /*educationHistory: dto.educations && {
        educationId: In(dto.educations),
        status: dto.educationStatus && In(dto.educationStatus),
      },*/
    };

    // 1 : N 관게 요소 필터링할 경우 필터링 외의 요소들도 조회하기 위함.
    if (dto.educations || dto.ministries) {
      const memberIds = (
        await this.membersRepository.find({
          where: {
            educationHistory: {
              educationId: dto.educations && In(dto.educations),
              status: dto.educationStatus && In(dto.educationStatus),
            },
            ministries: dto.ministries && { id: In(dto.ministries) },
          },
        })
      ).map((model) => model.id);

      findOptionsWhere.id = In(memberIds);
    }

    return findOptionsWhere;
  }

  async getMembers(churchId: number, dto: GetMemberDto, qr?: QueryRunner) {
    const membersRepository = this.getMembersRepository(qr);

    const selectOptions = this.parseSelectOption(dto);

    const relationOptions = this.parseRelationOption(dto);

    const findOptionsWhere: FindOptionsWhere<MemberModel> =
      await this.parseWhereOption(churchId, dto);

    const findOptionsOrder: FindOptionsOrder<MemberModel> =
      this.parseOrderOption(dto);

    const totalCount = await membersRepository.count({
      where: findOptionsWhere,
    });

    const totalPage = Math.ceil(totalCount / dto.take);

    const result = await membersRepository.find({
      where: findOptionsWhere,
      order: findOptionsOrder,
      relations: relationOptions,
      select: selectOptions,
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });

    // 현재 그룹만 필터링
    if (result.length > 0 && result[0].group) {
      result.forEach((member) => {
        member.group = member.group.filter((group) => group.endDate === null);
      });
    }

    return new ResponsePaginationDto<MemberModel>(
      result,
      result.length,
      dto.page,
      totalCount,
      totalPage,
    );
  }

  async getMemberById(
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

  async createMember(churchId: number, dto: CreateMemberDto, qr: QueryRunner) {
    const church = await this.churchesService.findChurchById(churchId, qr);

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

    return membersRepository.findOne({
      where: { id: memberId },
      relations: { guiding: true, guidedBy: true },
    });
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

    return {
      timestamp: new Date(),
      success: true,
      resultId: memberId,
    };
  }

  async isExistMemberById(
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
    memberId: number,
    familyMemberId: number,
    relation: string,
    qr: QueryRunner,
  ) {
    return this.familyService.updateFamilyRelation(
      memberId,
      familyMemberId,
      relation,
      qr,
    );
  }

  async deleteFamilyRelation(
    memberId: number,
    familyMemberId: number,
    qr?: QueryRunner,
  ) {
    return this.familyService.deleteFamilyRelation(
      memberId,
      familyMemberId,
      qr,
    );
  }

  async updateMemberOfficer(
    member: MemberModel,
    dto: UpdateMemberOfficerDto,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const officerId = dto.isDeleteOfficer ? null : dto.officerId;
    const officerStartDate = dto.officerStartDate;
    const officerStartChurch = dto.officerStartChurch;

    return membersRepository.update(
      { id: member.id },
      { officerId, officerStartDate, officerStartChurch },
    );
  }

  async updateMemberMinistry(
    member: MemberModel,
    dto: UpdateMemberMinistryDto,
    ministry: MinistryModel,
    qr: QueryRunner,
  ) {
    const memberRepository = this.getMembersRepository(qr);

    const oldMinistries = member.ministries;

    member.ministries = dto.isDeleteMinistry
      ? member.ministries.filter((ministry) => ministry.id !== dto.ministryId)
      : [...oldMinistries, ministry];

    return memberRepository.save(member);
  }

  /*async updateMemberEducation(
    member: MemberModel,
    dto: UpdateMemberEducationDto,
    education: EducationModel,
    qr: QueryRunner,
  ) {
    const memberRepository = this.getMembersRepository(qr);

    const oldEducations = member.educations;

    member.educations = dto.isDeleteEducation
      ? member.educations.filter(
          (education) => education.id !== dto.educationId,
        )
      : [...oldEducations, education];

    return memberRepository.save(member);
  }*/

  /*async updateMemberGroup(
    member: MemberModel,
    dto: UpdateMemberGroupDto,
    qr: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const groupId = dto.isDeleteGroup ? null : dto.groupId;

    return membersRepository.update(
      {
        id: member.id,
      },
      {
        groupId,
      },
    );
  }*/
}
