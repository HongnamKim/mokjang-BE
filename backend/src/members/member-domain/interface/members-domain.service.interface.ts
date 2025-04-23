import { GetMemberDto } from '../../dto/get-member.dto';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  QueryRunner,
  UpdateResult,
} from 'typeorm';
import { MemberModel } from '../../entity/member.entity';
import { MemberPaginationResultDto } from '../../dto/member-pagination-result.dto';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { CreateMemberDto } from '../../dto/create-member.dto';
import { UpdateMemberDto } from '../../dto/update-member.dto';
import { OfficerModel } from '../../../management/officers/entity/officer.entity';
import { MinistryModel } from '../../../management/ministries/entity/ministry.entity';
import { GroupModel } from '../../../management/groups/entity/group.entity';
import { GroupRoleModel } from '../../../management/groups/entity/group-role.entity';
import { UserModel } from '../../../user/entity/user.entity';

export const IMEMBERS_DOMAIN_SERVICE = Symbol('IMEMBERS_DOMAIN_SERVICE');

export interface IMembersDomainService {
  findMembers(
    dto: GetMemberDto,
    whereOptions: FindOptionsWhere<MemberModel>,
    orderOptions: FindOptionsOrder<MemberModel>,
    relationOptions: FindOptionsRelations<MemberModel>,
    selectOptions: FindOptionsSelect<MemberModel>,
    qr?: QueryRunner,
  ): Promise<MemberPaginationResultDto>;

  findMembersById(
    church: ChurchModel,
    ids: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel[]>;

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

  findMemberModelByUserId(
    church: ChurchModel,
    userId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel>;

  linkUserToMember(
    member: MemberModel,
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

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

  endMemberEducation(
    member: MemberModel,
    educationEnrollmentId: number,
    qr: QueryRunner,
  ): Promise<MemberModel>;

  startMemberGroup(
    member: MemberModel,
    group: GroupModel,
    groupRole: GroupRoleModel | undefined,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  endMemberGroup(member: MemberModel, qr: QueryRunner): Promise<UpdateResult>;
}
