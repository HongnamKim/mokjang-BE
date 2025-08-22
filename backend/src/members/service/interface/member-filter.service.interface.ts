import { MemberModel } from '../../entity/member.entity';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { ConcealedMemberDto } from '../../dto/response/get-member-response.dto';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { QueryRunner } from 'typeorm';

export const IMEMBER_FILTER_SERVICE = Symbol('MEMBER_FILTER_SERVICE');

export interface IMemberFilterService {
  filterMembers(
    requestManager: ChurchUserModel,
    members: MemberModel[],
    scopeGroupIds: number[],
  ): ConcealedMemberDto[];

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
