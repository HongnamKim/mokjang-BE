import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { MemberModel } from '../entity/member.entity';

export const MemberSummarizedRelation: FindOptionsRelations<MemberModel> = {
  officer: true,
  group: true,
};

export const MemberSummarizedSelect: FindOptionsSelect<MemberModel> = {
  id: true,
  name: true,
  profileImageUrl: true,
  mobilePhone: true,
  birth: true,
  isLunar: true,
  isLeafMonth: true,
  officer: {
    id: true,
    name: true,
  },
  group: {
    id: true,
    name: true,
  },
  groupRole: true,
};
