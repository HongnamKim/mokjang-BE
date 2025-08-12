import { Inject, Injectable } from '@nestjs/common';
import { MemberModel } from '../entity/member.entity';
import { FindOptionsOrder, FindOptionsWhere, QueryRunner } from 'typeorm';
import { CreateMemberDto } from '../dto/request/create-member.dto';
import { UpdateMemberDto } from '../dto/request/update-member.dto';
import { GetMemberDto } from '../dto/request/get-member.dto';
import { DeleteMemberResponseDto } from '../dto/response/delete-member-response.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MemberDeletedEvent } from '../events/member.event';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../member-domain/interface/members-domain.service.interface';
import {
  ISEARCH_MEMBERS_SERVICE,
  ISearchMembersService,
} from './interface/search-members.service.interface';
import {
  IFAMILY_RELATION_DOMAIN_SERVICE,
  IFamilyRelationDomainService,
} from '../../family-relation/family-relation-domain/service/interface/family-relation-domain.service.interface';
import { MemberPaginationResponseDto } from '../dto/response/member-pagination-response.dto';
import { GetSimpleMembersDto } from '../dto/request/get-simple-members.dto';
import { SimpleMembersPaginationResponseDto } from '../dto/response/simple-members-pagination-response.dto';
import { PostMemberResponseDto } from '../dto/response/post-member-response.dto';
import { PatchMemberResponseDto } from '../dto/response/patch-member-response.dto';
import { GetMemberResponseDto } from '../dto/response/get-member-response.dto';
import {
  IMEMBER_FILTER_SERVICE,
  IMemberFilterService,
} from './interface/member-filter.service.interface';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../../worship/worship-domain/interface/worship-domain.service.interface';
import {
  IWORSHIP_ENROLLMENT_DOMAIN_SERVICE,
  IWorshipEnrollmentDomainService,
} from '../../worship/worship-domain/interface/worship-enrollment-domain.service.interface';
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { getHistoryStartDate } from '../../member-history/history-date.utils';
import { GetMemberListDto } from '../dto/list/get-member-list.dto';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';

@Injectable()
export class MembersService {
  constructor(
    private readonly eventEmitter: EventEmitter2,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(ISEARCH_MEMBERS_SERVICE)
    private readonly searchMembersService: ISearchMembersService,
    @Inject(IFAMILY_RELATION_DOMAIN_SERVICE)
    private readonly familyDomainService: IFamilyRelationDomainService,
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
    @Inject(IWORSHIP_ENROLLMENT_DOMAIN_SERVICE)
    private readonly worshipEnrollmentDomainService: IWorshipEnrollmentDomainService,

    @Inject(IMEMBER_FILTER_SERVICE)
    private readonly memberFilterService: IMemberFilterService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  async getMembers(
    churchId: number,
    requestManager: ChurchUserModel,
    dto: GetMemberDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const whereOptions: FindOptionsWhere<MemberModel> =
      this.searchMembersService.parseWhereOption(church, dto);

    const orderOptions: FindOptionsOrder<MemberModel> =
      this.searchMembersService.parseOrderOption(dto);

    const relationOptions = this.searchMembersService.parseRelationOption(dto);

    const selectOptions = this.searchMembersService.parseSelectOption(dto);

    const { data, totalCount } = await this.membersDomainService.findMembers(
      dto,
      whereOptions,
      orderOptions,
      relationOptions,
      selectOptions,
      qr,
    );

    const filteredMember = await this.memberFilterService.filterMembers(
      church,
      requestManager,
      data,
    );

    return new MemberPaginationResponseDto(
      //data,
      filteredMember,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async getMemberById(
    churchId: number,
    memberId: number,
    requestManager: ChurchUserModel,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const member = await this.membersDomainService.findMemberById(
      church,
      memberId,
      qr,
    );

    const filteredMember = await this.memberFilterService.filterMember(
      church,
      requestManager,
      member,
    );

    return new GetMemberResponseDto(filteredMember);
  }

  async createMember(churchId: number, dto: CreateMemberDto, qr: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    // 교회의 교인 수 증가
    await this.churchesDomainService.incrementMemberCount(church, qr);
    church.memberCount++;

    dto.utcRegisteredAt = dto.registeredAt
      ? fromZonedTime(dto.registeredAt, TIME_ZONE.SEOUL)
      : getHistoryStartDate(TIME_ZONE.SEOUL);

    dto.utcBirth = dto.birth
      ? fromZonedTime(dto.birth, TIME_ZONE.SEOUL)
      : undefined;

    const newMember = await this.membersDomainService.createMember(
      church,
      dto,
      qr,
    );

    const worships = await this.worshipDomainService.findAllWorships(
      church,
      qr,
    );

    await this.worshipEnrollmentDomainService.createNewMemberEnrollments(
      newMember,
      worships,
      qr,
    );

    // 가족 등록
    if (dto.familyMemberId && dto.relation) {
      const newFamily = await this.membersDomainService.findMemberModelById(
        church,
        dto.familyMemberId,
        qr,
      );

      await this.familyDomainService.fetchAndCreateFamilyRelations(
        newMember,
        newFamily,
        dto.relation,
        qr,
      );
    }

    return new PostMemberResponseDto(newMember);
  }

  async updateMember(
    church: ChurchModel,
    targetMember: MemberModel,
    dto: UpdateMemberDto,
    qr?: QueryRunner,
  ) {
    dto.utcRegisteredAt = dto.registeredAt
      ? fromZonedTime(dto.registeredAt, TIME_ZONE.SEOUL)
      : undefined;

    dto.utcBirth = dto.birth
      ? fromZonedTime(dto.birth, TIME_ZONE.SEOUL)
      : undefined;

    const updatedMember = await this.membersDomainService.updateMember(
      church,
      targetMember,
      dto,
      qr,
    );

    return new PatchMemberResponseDto(updatedMember);
  }

  // 교인 soft delete
  // 교육 등록도 soft delete
  async softDeleteMember(
    church: ChurchModel,
    targetMember: MemberModel,
    qr: QueryRunner,
  ): Promise<DeleteMemberResponseDto> {
    /*const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const targetMember = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
    );*/

    // 교인 삭제
    await this.membersDomainService.deleteMember(church, targetMember, qr);

    // 가족 관계 모두 삭제
    await this.familyDomainService.deleteAllFamilyRelations(targetMember, qr);

    // 교회 교인 수 감소
    await this.churchesDomainService.decrementMemberCount(church, qr);

    // 이벤트는 트랜잭션 처리 불가능 본 요청과 이벤트 요청은 서로 달라서 본 요청 응답이 나갈 때
    // 트랜잭션이 끝나게 되어 이벤트 요청에서 트랜잭션 처리를 할 수 없음
    this.eventEmitter.emit(
      'member.deleted',
      new MemberDeletedEvent(church.id, targetMember.id),
    );

    return new DeleteMemberResponseDto(
      new Date(),
      targetMember.id,
      targetMember.name,
      true,
    );
  }

  async getSimpleMembers(churchId: number, dto: GetSimpleMembersDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const { data, totalCount } =
      await this.membersDomainService.findSimpleMembers(church, dto);

    return new SimpleMembersPaginationResponseDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async getMemberList(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    dto: GetMemberListDto,
  ) {
    const result = await this.membersDomainService.getMemberListWithPagination(
      church,
      dto,
    );

    return {
      items: result.items,
      /*items: result.items.map((member) => ({
        id: member.id,
        name: member.name,
        profileImage: member.profileImage,
        registeredAt: member.registeredAt,
        birth: member.birth,
      })),*/
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }
}
