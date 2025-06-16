import { MemberModel } from '../../entity/member.entity';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { ConcealedMemberDto } from '../../dto/response/get-member-response.dto';

export const IMEMBER_FILTER_SERVICE = Symbol('MEMBER_FILTER_SERVICE');

export interface IMemberFilterService {
  filterMembers(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    members: MemberModel[],
  ): Promise<ConcealedMemberDto[]>;

  filterMember(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    member: MemberModel,
  ): Promise<ConcealedMemberDto>;
}
