import { GetMemberDto } from '../../dto/request/get-member.dto';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  QueryRunner,
  UpdateResult,
} from 'typeorm';
import { MemberModel } from '../../entity/member.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { CreateMemberDto } from '../../dto/request/create-member.dto';
import { UpdateMemberDto } from '../../dto/request/update-member.dto';
import { OfficerModel } from '../../../management/officers/entity/officer.entity';
import { MinistryModel } from '../../../management/ministries/entity/ministry.entity';
import { GroupModel } from '../../../management/groups/entity/group.entity';
import { MembersDomainPaginationResultDto } from '../dto/members-domain-pagination-result.dto';
import { GetSimpleMembersDto } from '../../dto/request/get-simple-members.dto';
import { GetRecommendLinkMemberDto } from '../../dto/request/get-recommend-link-member.dto';
import { GetBirthdayMembersDto } from '../../../calendar/dto/request/birthday/get-birthday-members.dto';
import { WidgetRange } from '../../../home/const/widget-range.enum';
import { GetNewMemberDetailDto } from '../../../home/dto/request/get-new-member-detail.dto';
import { GetGroupMembersDto } from '../../../management/groups/dto/request/get-group-members.dto';
import { GroupRole } from '../../../management/groups/const/group-role.enum';
import { MinistryGroupModel } from '../../../management/ministries/entity/ministry-group.entity';
import { GetMinistryGroupMembersDto } from '../../../management/ministries/dto/ministry-group/request/get-ministry-group-members.dto';

export const IMEMBERS_DOMAIN_SERVICE = Symbol('IMEMBERS_DOMAIN_SERVICE');

export interface IMembersDomainService {
  findMembers(
    dto: GetMemberDto,
    whereOptions: FindOptionsWhere<MemberModel>,
    orderOptions: FindOptionsOrder<MemberModel>,
    relationOptions: FindOptionsRelations<MemberModel>,
    selectOptions: FindOptionsSelect<MemberModel>,
    qr?: QueryRunner,
  ): Promise<{ data: MemberModel[]; totalCount: number }>;

  migrationBirthdayMMDD(church: ChurchModel): Promise<void>;

  findBirthdayMembers(
    church: ChurchModel,
    dto: GetBirthdayMembersDto,
    qr?: QueryRunner,
  ): Promise<MemberModel[]>;

  findSimpleMembers(
    church: ChurchModel,
    dto: GetSimpleMembersDto,
    qr?: QueryRunner,
  ): Promise<MembersDomainPaginationResultDto>;

  findAllMembers(church: ChurchModel, qr?: QueryRunner): Promise<MemberModel[]>;

  findRecommendLinkMember(
    church: ChurchModel,
    dto: GetRecommendLinkMemberDto,
    qr?: QueryRunner,
  ): Promise<MemberModel[]>;

  findMembersById(
    church: ChurchModel,
    ids: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel[]>;

  findMinistryGroupMembersByIds(
    ministryGroup: MinistryGroupModel,
    memberIds: number[],
    qr?: QueryRunner,
  ): Promise<MemberModel[]>;

  countAllMembers(church: ChurchModel, qr?: QueryRunner): Promise<number>;

  findMemberById(
    church: ChurchModel,
    memberId: number,
    qr?: QueryRunner,
  ): Promise<MemberModel>;

  findMemberModelById(
    church: ChurchModel,
    memberId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel>;

  findDeleteMemberModelById(
    church: ChurchModel,
    memberId: number,
    relations?: FindOptionsRelations<MemberModel>,
    qr?: QueryRunner,
  ): Promise<MemberModel>;

  findMemberModelByNameAndMobilePhone(
    church: ChurchModel,
    name: string,
    mobilePhone: string,
    relationOptions?: FindOptionsRelations<MemberModel>,
    qr?: QueryRunner,
  ): Promise<MemberModel | null>;

  isExistMemberByNameAndMobilePhone(
    church: ChurchModel,
    name: string,
    mobilePhone: string,
    qr?: QueryRunner,
  ): Promise<boolean>;

  isExistMemberById(
    church: ChurchModel,
    memberId: number,
    qr?: QueryRunner,
  ): Promise<boolean>;

  createMember(
    church: ChurchModel,
    dto: CreateMemberDto,
    qr: QueryRunner,
  ): Promise<MemberModel>;

  updateMember(
    church: ChurchModel,
    member: MemberModel,
    dto: UpdateMemberDto,
    qr?: QueryRunner,
  ): Promise<MemberModel>;

  deleteMember(
    church: ChurchModel,
    member: MemberModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  startMemberOfficer(
    member: MemberModel,
    officer: OfficerModel,
    officerStartDate: Date,
    officerStartChurch: string,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  endMemberOfficer(member: MemberModel, qr: QueryRunner): Promise<UpdateResult>;

  startMemberMinistry(
    member: MemberModel,
    ministry: MinistryModel,
    qr: QueryRunner,
  ): Promise<MemberModel>;

  endMemberMinistry(
    member: MemberModel,
    targetMinistry: MinistryModel,
    qr: QueryRunner,
  ): Promise<MemberModel>;

  startMemberGroup(
    member: MemberModel,
    group: GroupModel,
    groupRole: GroupRole,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  endMemberGroup(member: MemberModel, qr: QueryRunner): Promise<UpdateResult>;

  updateGroupRole(
    group: GroupModel,
    newLeaderMember: MemberModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  getNewMemberSummary(
    church: ChurchModel,
    range: WidgetRange,
    from: Date,
    to: Date,
  ): Promise<any[]>;

  findNewMemberDetails(
    church: ChurchModel,
    dto: GetNewMemberDetailDto,
    from: Date,
    to: Date,
  ): Promise<MemberModel[]>;

  findGroupMembers(
    church: ChurchModel,
    group: GroupModel,
    dto: GetGroupMembersDto,
    qr?: QueryRunner,
  ): Promise<MemberModel[]>;

  findMinistryGroupMembers(
    ministryGroup: MinistryGroupModel,
    dto: GetMinistryGroupMembersDto,
  ): Promise<MemberModel[]>;

  updateMinistryGroupRole(
    members: MemberModel[],
    ministryGroupRole: GroupRole,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  findMinistryGroupMemberModel(
    ministryGroup: MinistryGroupModel,
    memberId: number,
    qr?: QueryRunner,
    relations?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel>;
}
