import { MemberModel } from '../../entity/member.entity';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';

export const IMEMBER_FILTER_SERVICE = Symbol('MEMBER_FILTER_SERVICE');

export interface IMemberFilterService {
  filterMembers(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    members: MemberModel[],
  ): Promise<MemberModel[]>;

  filterMember(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    member: MemberModel,
  ): Promise<MemberModel>;
}
