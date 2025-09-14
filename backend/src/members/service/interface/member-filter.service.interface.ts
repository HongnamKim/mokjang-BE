import { MemberModel } from '../../entity/member.entity';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { ConcealedMemberDto } from '../../dto/response/get-member-response.dto';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { QueryRunner } from 'typeorm';
import { MemberDto } from '../../dto/member.dto';

export const IMEMBER_FILTER_SERVICE = Symbol('MEMBER_FILTER_SERVICE');

export interface IMemberFilterService {
  filterMembers(
    requestManager: ChurchUserModel,
    members: MemberModel[],
    scopeGroupIds: number[],
  ): ConcealedMemberDto[];

  /**
   * 직분, 그룹, 사역 내 교인 필터링 시 사용
   * @param requestManager
   * @param memberDto
   * @param scopeGroupIds
   */
  filterMemberDto(
    requestManager: ChurchUserModel,
    memberDto: MemberDto[],
    scopeGroupIds: number[],
  ): MemberDto[];

  filterMember(
    requestManager: ChurchUserModel,
    member: MemberModel,
    scopeGroupIds: number[],
  ): ConcealedMemberDto;

  getScopeGroupIds(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    qr?: QueryRunner,
  ): Promise<number[]>;
}
