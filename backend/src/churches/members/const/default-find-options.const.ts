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
};
