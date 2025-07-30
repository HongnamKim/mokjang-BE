import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetUnassignedMembersDto } from '../../../management/ministries/dto/ministry-group/request/member/get-unassigned-members.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { MemberModel } from '../../entity/member.entity';
import { OfficerModel } from '../../../management/officers/entity/officer.entity';
import { GetOfficerMembersDto } from '../../../management/officers/dto/request/members/get-officer-members.dto';
import { OfficerMemberDto } from '../../dto/officer-member.dto';

export const IOFFICER_MEMBERS_DOMAIN_SERVICE = Symbol(
  'IOFFICER_MEMBERS_DOMAIN_SERVICE',
);

export interface IOfficerMembersDomainService {
  findUnassignedMembers(
    church: ChurchModel,
    dto: GetUnassignedMembersDto,
    qr?: QueryRunner,
  ): Promise<MemberModel[]>;

  findOfficerMembers(
    church: ChurchModel,
    officer: OfficerModel,
    dto: GetOfficerMembersDto,
    qr?: QueryRunner,
  ): Promise<OfficerMemberDto[]>;

  findOfficerMembersByIds(
    church: ChurchModel,
    officer: OfficerModel,
    memberIds: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel[]>;

  assignOfficer(
    members: MemberModel[],
    officer: OfficerModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  removeOfficer(members: MemberModel[], qr: QueryRunner): Promise<UpdateResult>;
}
