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

export const MemberSimpleSelect: FindOptionsSelect<MemberModel> = {
  id: true,
  name: true,
  profileImageUrl: true,
  registeredAt: true,
  //mobilePhone: true,
  //birth: true,
  //isLunar: true,
  //isLeafMonth: true,
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

export const MemberSimpleSelectQB: string[] = [
  'member.id',
  'member.name',
  'member.profileImageUrl',
  //'member.mobilePhone',
  'member.registeredAt',
  //'member.birth',
  //'member.isLunar',
  //'member.isLeafMonth',
  'member.groupRole',
  'member.ministryGroupRole',
];

export const MemberSummarizedOfficerSelectQB: string[] = [
  'officer.id',
  'officer.name',
];

export const OfficerSelectQB = (alias: string = 'officer') => {
  if (alias === 'officer') {
    return MemberSummarizedOfficerSelectQB;
  }

  return MemberSummarizedOfficerSelectQB.map((column) =>
    column.replace('officer', alias),
  );
};

export const MemberSummarizedGroupSelectQB: string[] = [
  'group.id',
  'group.name',
];

export const GroupSelectQB = (alias: string = 'group') => {
  if (alias === 'group') {
    return MemberSummarizedGroupSelectQB;
  }

  return MemberSummarizedGroupSelectQB.map((column) =>
    column.replace('group', alias),
  );
};

export const InChargeSummarizedSelectQB: string[] = [
  'inCharge.id',
  'inCharge.name',
  'inCharge.profileImageUrl',
  //'inCharge.mobilePhone',
  //'inCharge.registeredAt',
  //'inCharge.birth',
  //'inCharge.isLunar',
  //'inCharge.isLeafMonth',
  //'inCharge.groupRole',
  //'inCharge.ministryGroupRole',
];

export const InChargeSummarizedSelect: FindOptionsSelect<MemberModel> = {
  id: true,
  name: true,
  profileImageUrl: true,
  //registeredAt: true,
  //mobilePhone: true,
  //birth: true,
  //isLunar: true,
  //isLeafMonth: true,
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

export const ReceiverSummarizedSelectQB: string[] = [
  'receiver.id',
  'receiver.name',
  'receiver.profileImageUrl',
  //'receiver.mobilePhone',
  //'receiver.registeredAt',
  //'receiver.birth',
  //'receiver.isLunar',
  //'receiver.isLeafMonth',
  //'receiver.groupRole',
  //'receiver.ministryGroupRole',
];

export const ReceiverSummarizedSelect: FindOptionsSelect<MemberModel> = {
  id: true,
  name: true,
  profileImageUrl: true,
  //registeredAt: true,
  //mobilePhone: true,
  //birth: true,
  //isLunar: true,
  //isLeafMonth: true,
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
