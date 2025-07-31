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
  registeredAt: true,
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
  ministryGroupRole: true,
};

export const MemberSummarizedSelectQB: string[] = [
  'member.id',
  'member.name',
  'member.profileImageUrl',
  'member.mobilePhone',
  'member.registeredAt',
  'member.birth',
  'member.isLunar',
  'member.isLeafMonth',
  'member.groupRole',
  'member.ministryGroupRole',
];

export const MemberSummarizedOfficerSelectQB: string[] = [
  'officer.id',
  'officer.name',
];

export const MemberSummarizedGroupSelectQB: string[] = [
  'group.id',
  'group.name',
];
