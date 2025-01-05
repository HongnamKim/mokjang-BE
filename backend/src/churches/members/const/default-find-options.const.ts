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
  educationHistory: true,
  group: true,
};

export const DefaultMemberSelectOption: FindOptionsSelect<MemberModel> = {
  guidedBy: {
    id: true,
    name: true,
  } /*
  family: {
    relation: true,
    familyMember: {
      id: true,
      name: true,
    },
  },*/,
  officer: {
    id: true,
    name: true,
  },
  ministries: {
    id: true,
    name: true,
  },
  educationHistory: {
    id: true,
    educationId: true,
    educationName: true,
    status: true,
  },
  group: {
    id: true,
    name: true,
  },
};

export const DefaultMembersRelationOption: FindOptionsRelations<MemberModel> = {
  //guidedBy: true,
  group: true,
  ministries: true,
  //educations: true,
  educationHistory: true,
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
  ministries: {
    id: true,
    name: true,
  },
  /*educations: {
    id: true,
    name: true,
  },*/
  educationHistory: {
    id: true,
    educationId: true,
    educationName: true,
    status: true,
  },
  officer: {
    id: true,
    name: true,
  },
};
