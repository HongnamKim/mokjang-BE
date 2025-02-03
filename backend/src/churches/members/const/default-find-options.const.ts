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
  //educations: true,
  educations: {
    educationTerm: true /*{
      education: true,
    },*/,
  },
  group: true,
  groupRole: true,
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
  educations: {
    id: true,
    status: true,
    educationTerm: {
      id: true,
      term: true,
      educationName: true /*
      education: {
        id: true,
        name: true,
      },*/,
    },
  },
  group: {
    id: true,
    name: true,
  },
  groupRole: {
    id: true,
    role: true,
  },
};

export const DefaultMembersRelationOption: FindOptionsRelations<MemberModel> = {
  //guidedBy: true,
  group: true,
  groupRole: true,
  ministries: true,
  //educations: true,
  educations: {
    educationTerm: true /*{
      education: true,
    }*/,
  },
  officer: true,
};

export const DefaultMembersSelectOption: FindOptionsSelect<MemberModel> = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  registeredAt: true,
  mobilePhone: true,
  birth: true,
  isLunar: true,
  gender: true,
  group: {
    id: true,
    name: true,
  },
  groupRole: {
    id: true,
    role: true,
  },
  ministries: {
    id: true,
    name: true,
  },
  //educations: true,
  educations: {
    id: true,
    status: true,
    educationTerm: {
      id: true,
      term: true,
      educationName: true /*
      education: {
        id: true,
        name: true,
      },*/,
    },
  },
  officer: {
    id: true,
    name: true,
  },
};
