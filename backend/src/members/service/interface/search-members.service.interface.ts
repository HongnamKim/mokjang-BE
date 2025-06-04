import { GetMemberDto } from '../../dto/request/get-member.dto';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
} from 'typeorm';
import { MemberModel } from '../../entity/member.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';

export const ISEARCH_MEMBERS_SERVICE = Symbol('ISEARCH_MEMBERS_SERVICE');

export interface ISearchMembersService {
  parseRelationOption(dto: GetMemberDto): FindOptionsRelations<MemberModel>;

  parseSelectOption(dto: GetMemberDto): FindOptionsSelect<MemberModel>;

  parseWhereOption(
    church: ChurchModel,
    dto: GetMemberDto,
  ): FindOptionsWhere<MemberModel>;

  parseOrderOption(dto: GetMemberDto): FindOptionsOrder<MemberModel>;
}
