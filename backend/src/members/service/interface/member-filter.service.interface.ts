import { MemberModel } from '../../entity/member.entity';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { ConcealedMemberDto } from '../../dto/response/get-member-response.dto';

export const IMEMBER_FILTER_SERVICE = Symbol('MEMBER_FILTER_SERVICE');

export interface IMemberFilterService {
  filterMembers(
    requestManager: ChurchUserModel,
    members: MemberModel[],
    scopeGroupIds: number[],
  ): Promise<ConcealedMemberDto[]>;

  filterMember(
    requestManager: ChurchUserModel,
    member: MemberModel,
    scopeGroupIds: number[],
  ): Promise<ConcealedMemberDto>;
}
