import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { MemberModel } from '../entity/member.entity';

export const DefaultMemberRelationOption: FindOptionsRelations<MemberModel> = {
  guiding: false,
  guidedBy: true,
  family: {
    familyMember: true,
  },
  officer: true,
  ministries: true,
  educationEnrollments: {
    educationTerm: true,
  },
  group: true,
  //groupRole: true,
  //user: true,
};

export const DefaultMemberSelectOption: FindOptionsSelect<MemberModel> = {
  guidedBy: {
    id: true,
    name: true,
  },
  officer: {
    id: true,
    name: true,
  },
  ministries: {
    id: true,
    name: true,
  },
  educationEnrollments: {
    id: true,
    status: true,
    educationTerm: {
      id: true,
      term: true,
      educationName: true,
    },
  },
  group: {
    id: true,
    name: true,
  },
  /*groupRole: {
    id: true,
    role: true,
  },*/
  /*user: {
    role: true,
  },*/
};

export const DefaultMembersRelationOption: FindOptionsRelations<MemberModel> = {
  group: true,
  //groupRole: true,
  ministries: true,
  educationEnrollments: {
    educationTerm: true,
  },
  officer: true,
  //user: true,
};

export const DefaultMembersSelectOption: FindOptionsSelect<MemberModel> = {
  id: true,
  profileImageUrl: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  registeredAt: true,
  mobilePhone: true,
  birth: true,
  isLunar: true,
  gender: true,
  groupRole: true,
  group: {
    id: true,
    name: true,
  },
  /*groupRole: {
    id: true,
    role: true,
  },*/
  ministries: {
    id: true,
    name: true,
  },
  educationEnrollments: {
    id: true,
    status: true,
    educationTerm: {
      id: true,
      term: true,
      educationName: true,
    },
  },
  officer: {
    id: true,
    name: true,
  },
  /*user: {
    role: true,
  },*/
};

export const HardDeleteMemberRelationOptions: FindOptionsRelations<MemberModel> =
  {
    ...DefaultMemberRelationOption,
    guiding: true,
    inChargeEducationTerm: true,
    ministryHistory: true,
    officerHistory: true,
    groupHistory: true,
  };
